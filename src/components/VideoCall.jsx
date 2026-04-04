import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './VideoCall.css';

function VideoCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, users, startVideoCall, endVideoCall, toggleAudio, toggleVideo, videoCallState } = useApp();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const durationIntervalRef = useRef(null);
  
  // Find the participant user
  const participant = users.find(u => u.id === parseInt(id));

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!participant) {
      setError('User not found');
      setIsConnecting(false);
      return;
    }

    // Start the video call
    startVideoCall(participant, 'outgoing');

    // Initialize media devices
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate remote stream (in a real app, this would come from WebRTC)
        // For demo purposes, we'll show a placeholder
        setRemoteStream(stream); // Using local stream as placeholder
        setIsConnecting(false);

        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera/microphone. Please check permissions.');
        setIsConnecting(false);
      }
    };

    initMedia();

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      endVideoCall();
    };
  }, []);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    endVideoCall();
    navigate(-1);
  };

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
    toggleAudio();
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
    toggleVideo();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentUser) {
    return <div className="video-call-loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="video-call-container">
        <div className="video-call-error">
          <div className="error-icon">⚠️</div>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button className="btn-end-call" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Remote Video (Main View) */}
      <div className="remote-video-container">
        {isConnecting ? (
          <div className="connecting-overlay">
            <div className="connecting-animation">
              <div className="pulse-ring"></div>
              <div className="participant-avatar-large">
                {participant?.name?.charAt(0) || '?'}
              </div>
            </div>
            <h3>Connecting to {participant?.name}...</h3>
            <p>Please wait while we establish the connection</p>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        )}
        
        {/* Call Info Overlay */}
        <div className="call-info-overlay">
          <div className="call-status">
            <span className="status-dot"></span>
            {isConnecting ? 'Connecting...' : 'Connected'}
          </div>
          <div className="call-duration">
            {formatDuration(callDuration)}
          </div>
        </div>

        {/* Participant Info */}
        <div className="participant-info">
          <div className="participant-name">
            {participant?.name}
          </div>
          <div className="participant-role">
            {participant?.role === 'doctor' ? participant.specialty : participant?.role}
          </div>
        </div>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="local-video-container">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="local-video"
        />
        <div className="local-video-label">You</div>
      </div>

      {/* Call Controls */}
      <div className="call-controls">
        <button 
          className={`control-button ${!videoCallState.isAudioEnabled ? 'disabled' : ''}`}
          onClick={handleToggleAudio}
          title={videoCallState.isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {videoCallState.isAudioEnabled ? '🎤' : '🔇'}
        </button>
        
        <button 
          className={`control-button ${!videoCallState.isVideoEnabled ? 'disabled' : ''}`}
          onClick={handleToggleVideo}
          title={videoCallState.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {videoCallState.isVideoEnabled ? '📹' : '📷'}
        </button>
        
        <button 
          className="control-button end-call"
          onClick={handleEndCall}
          title="End call"
        >
          📞
        </button>
      </div>
    </div>
  );
}

export default VideoCall;

