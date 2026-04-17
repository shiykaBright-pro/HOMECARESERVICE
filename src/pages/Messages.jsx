import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './Messages.css';

function Messages() {
  const { currentUser, users, messages, sendMessage, getConversation } = useApp();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatCategory, setChatCategory] = useState('all');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser, messages]);

  // Get available chat categories based on user role
  const getChatCategories = () => {
    if (!currentUser) return [];
    
    const categories = [];
    
    if (currentUser.role === 'patient') {
      categories.push({ value: 'doctor', label: '👨‍⚕️ Doctors', route: '/patient-dashboard?tab=doctors', icon: '👨‍⚕️' });
      categories.push({ value: 'nurse', label: '👩‍⚕️ Nurses', route: '/patient-dashboard?tab=doctors', icon: '👩‍⚕️' });
    } else if (currentUser.role === 'doctor') {
      categories.push({ value: 'patient', label: '👤 Patients', route: '/doctor-dashboard?tab=patients', icon: '👤' });
    } else if (currentUser.role === 'nurse') {
      categories.push({ value: 'dashboard', label: '🏠 My Dashboard', route: '/nurse-dashboard', icon: '🏠' });
      categories.push({ value: 'patient', label: '👤 Patients', route: '/nurse-dashboard?tab=patients', icon: '👤' });
      categories.push({ value: 'doctor', label: '👨‍⚕️ Doctors', route: '/nurse-dashboard?tab=messages', icon: '👨‍⚕️' });
    } else if (currentUser.role === 'admin') {
      categories.push({ value: 'dashboard', label: '🏠 My Dashboard', route: '/admin-dashboard', icon: '🏠' });
      categories.push({ value: 'patient', label: '👤 Patients', route: '/admin-dashboard?tab=users', icon: '👤' });
      categories.push({ value: 'doctor', label: '👨‍⚕️ Doctors', route: '/admin-dashboard?tab=users', icon: '👨‍⚕️' });
      categories.push({ value: 'nurse', label: '👩‍⚕️ Nurses', route: '/admin-dashboard?tab=users', icon: '👩‍⚕️' });
    }
    
    return categories;
  };

  // Handle category change - navigate to the respective dashboard
  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    const category = getChatCategories().find(c => c.value === selectedValue);
    
    if (category && category.route) {
      navigate(category.route);
    } else if (selectedValue === 'all') {
      setChatCategory('all');
    }
  };

  // Get users based on selected category
  const getFilteredUsers = () => {
    if (!currentUser) return [];
    
    let filteredUsers = [];
    
    if (chatCategory === 'all') {
      // Show all available users based on role
      if (currentUser.role === 'patient') {
        filteredUsers = users.filter(u => u.role === 'doctor' || u.role === 'nurse');
      } else if (currentUser.role === 'doctor' || currentUser.role === 'nurse') {
        filteredUsers = users.filter(u => u.role === 'patient');
      } else if (currentUser.role === 'admin') {
        filteredUsers = users.filter(u => u.id !== currentUser.id);
      }
    } else if (chatCategory === 'dashboard') {
      // Dashboard - no users to show
      filteredUsers = [];
    } else {
      // Filter by specific category
      if (currentUser.role === 'doctor' && chatCategory === 'doctor') {
        // For doctors, show other doctors (not themselves)
        filteredUsers = users.filter(u => u.role === 'doctor' && u.id !== currentUser.id);
      } else if (currentUser.role === 'patient') {
        filteredUsers = users.filter(u => u.role === chatCategory);
      } else if (currentUser.role === 'nurse') {
        if (chatCategory === 'doctor') {
          filteredUsers = users.filter(u => u.role === 'doctor');
        } else {
          filteredUsers = users.filter(u => u.role === chatCategory);
        }
      } else if (currentUser.role === 'admin') {
        filteredUsers = users.filter(u => u.role === chatCategory);
      }
    }
    
    return filteredUsers;
  };

  // Get all available users the current user can message (backwards compatibility)
  const getAvailableUsers = () => {
    if (!currentUser) return [];
    
    let availableUsers = [];
    if (currentUser.role === 'patient') {
      availableUsers = users.filter(u => u.role === 'doctor' || u.role === 'nurse');
    } else if (currentUser.role === 'doctor' || currentUser.role === 'nurse') {
      availableUsers = users.filter(u => u.role === 'patient');
    } else {
      availableUsers = users.filter(u => u.id !== currentUser.id);
    }
    
    return availableUsers;
  };

  // Get all available users as conversations (even without messages)
  const getConversations = () => {
    if (!currentUser) return [];
    
    const filteredUsers = getFilteredUsers();
    const conversations = filteredUsers.map(user => {
      const userMessages = getConversation(currentUser.id, user.id);
      const lastMessage = userMessages[userMessages.length - 1];
      const unreadCount = userMessages.filter(m => m.toId === currentUser.id && !m.read).length;
      
      return {
        user,
        lastMessage,
        unreadCount,
        messages: userMessages
      };
    });
    
    // Sort by last message time (most recent first), users without messages go to bottom
    return conversations.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return a.user.name.localeCompare(b.user.name);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    sendMessage({
      fromId: currentUser.id,
      fromName: currentUser.name,
      toId: selectedUser.id,
      message: newMessage.trim()
    });

    setNewMessage('');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const filteredUsers = getFilteredUsers().filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserRole = (user) => {
    if (user.role === 'doctor') return user.specialty || 'Doctor';
    if (user.role === 'nurse') return 'Nurse';
    return user.role;
  };

  const getCategoryLabel = () => {
    const categories = getChatCategories();
    const found = categories.find(c => c.value === chatCategory);
    return found ? found.label : 'All Chats';
  };

  if (!currentUser) {
    return (
      <div className="messages-page">
        <Navbar />
        <div className="messages-container">
          <div className="login-required">
            <h2>Please login to access messages</h2>
            <Link to="/login" className="btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <Navbar />
      <div className="messages-container">
        <div className="messages-sidebar">
  <div className="messages-header">
            <h2>💬 Messages</h2>
          </div>
          
          {/* Emergency Contacts Section */}
          <div className="emergency-contacts-section">
            <h3>🚨 Emergency Contacts</h3>
            <div className="emergency-contact-item">
              <div>
                <strong>John Doe (Patient Support)</strong><br />
                +237 679109117
              </div>
              <div className="emergency-actions">
                <a href="tel:+237679109117" className="btn-emergency-call">📞</a>
                <a href="sms:+237679109117" className="btn-emergency-sms">💬</a>
                <a href="https://wa.me/237679109117" className="btn-emergency-wa" target="_blank" rel="noopener">💚</a>
              </div>
            </div>
            <div className="emergency-contact-item">
              <div>
                <strong>Jane Doe (Emergency)</strong><br />
                +237 673233297
              </div>
              <div className="emergency-actions">
                <a href="tel:+237673233297" className="btn-emergency-call">📞</a>
                <a href="sms:+237673233297" className="btn-emergency-sms">💬</a>
                <a href="https://wa.me/237673233297" className="btn-emergency-wa" target="_blank" rel="noopener">💚</a>
              </div>
            </div>
            <div className="emergency-contact-item">
              <div>
                <strong>Emergency Response</strong><br />
                +237 673239967
              </div>
              <div className="emergency-actions">
                <a href="tel:+237673239967" className="btn-emergency-call">📞</a>
                <a href="sms:+237673239967" className="btn-emergency-sms">💬</a>
                <a href="https://wa.me/237673239967" className="btn-emergency-wa" target="_blank" rel="noopener">💚</a>
              </div>
            </div>
          </div>
          
          {/* Category Dropdown - navigates to dashboards */}
          <div className="category-dropdown">
            <select 
              value={chatCategory} 
              onChange={handleCategoryChange}
              className="category-select"
            >
              <option value="all">💬 All Messages</option>
              {getChatCategories().map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="messages-search">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="conversations-list">
            {searchQuery ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`conversation-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="conversation-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{user.name}</div>
                    <div className="conversation-preview">{getUserRole(user)}</div>
                  </div>
                </div>
              ))
            ) : chatCategory === 'dashboard' ? (
              <div className="no-conversations">
                <p>🏠 Go to your Dashboard</p>
                <p>Select an option from the dropdown above</p>
              </div>
            ) : (
              getConversations().length > 0 ? (
                getConversations().map(conversation => (
                  <div
                    key={conversation.user.id}
                    className={`conversation-item ${selectedUser?.id === conversation.user.id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(conversation.user)}
                  >
                    <div className="conversation-avatar">
                      {conversation.user.name.charAt(0)}
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-name">{conversation.user.name}</div>
                      <div className="conversation-preview">
                        {conversation.lastMessage?.fromId === currentUser.id ? 'You: ' : ''}
                        {conversation.lastMessage?.message?.substring(0, 30)}...
                      </div>
                    </div>
                    <div className="conversation-time">
                      {conversation.lastMessage?.timestamp?.split(' ')[1] || ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-conversations">
                  <p>📱 No conversations yet</p>
                  <p>Start chatting with your contacts below!</p>
                </div>
              )
            )}
          </div>
          
          {!searchQuery && chatCategory !== 'dashboard' && (
            <div className="new-conversation">
              <h3>Start New Chat</h3>
              <div className="users-list">
                {filteredUsers.slice(0, 5).map(user => (
                  <div
                    key={user.id}
                    className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">{user.name.charAt(0)}</div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-role">{getUserRole(user)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="messages-main">
          {selectedUser ? (
            <>
              <div className="chat-header-bar">
                <div className="chat-user-info">
                  <div className="chat-avatar">{selectedUser.name.charAt(0)}</div>
                  <div className="chat-user-details">
                    <h3>{selectedUser.name}</h3>
                    <span>{getUserRole(selectedUser)}</span>
                  </div>
                </div>
                <button 
                  className="video-call-button"
                  onClick={() => navigate(`/video-call/${selectedUser.id}`)}
                  title="Start Video Call"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 99999,
                    position: 'relative'
                  }}
                >
                  📹 Video Call
                </button>
              </div>
              
              <div className="messages-list">
                {getConversation(currentUser.id, selectedUser.id).map(msg => {
                  // Patient messages always on LEFT, Doctor/Nurse messages always on RIGHT
                  const sender = users.find(u => u.id === msg.fromId);
                  const isFromPatient = sender?.role === 'patient';
                  return (
                    <div
                      key={msg.id}
                      className={`message ${isFromPatient ? 'received' : 'sent'}`}
                    >
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="message-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  ➤
                </button>
              </form>
            </>
          ) : (
          <div className="no-chat-selected">
              <div className="whatsapp-logo-large">💬</div>
              <h2>Chat</h2>
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
