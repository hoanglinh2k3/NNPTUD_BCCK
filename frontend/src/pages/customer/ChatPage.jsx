import { useContext, useEffect, useState } from 'react';
import { messageApi } from '../../api/services';
import ChatWindow from '../../components/customer/ChatWindow';
import BackButton from '../../components/shared/BackButton';
import EmptyState from '../../components/shared/EmptyState';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { SocketContext } from '../../contexts/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { usePageData } from '../../hooks/usePageData';

function ChatPage({ backTo }) {
  const { user } = useAuth();
  const { chatSocket } = useContext(SocketContext);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const { data, loading } = usePageData(async () => {
    const conversations = await messageApi.getConversations();
    let supportContact = null;

    if (user?.role === 'Customer' && conversations.length === 0) {
      try {
        supportContact = await messageApi.getSupportContact();
      } catch (error) {
        supportContact = null;
      }
    }

    return {
      conversations,
      supportContact
    };
  }, [user?.id, user?.role]);

  const conversationList = data?.conversations?.length
    ? data.conversations
    : data?.supportContact
      ? [
          {
            id: `support-${data.supportContact.userId}`,
            userId: data.supportContact.userId,
            fullName: data.supportContact.fullName,
            avatarUrl: data.supportContact.avatarUrl,
            content: 'Start a conversation with the shop'
          }
        ]
      : [];

  useEffect(() => {
    if (conversationList.length && !selectedConversation) {
      setSelectedConversation(conversationList[0]);
    }
  }, [conversationList, selectedConversation]);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) {
        return;
      }

      const history = await messageApi.getHistory(selectedConversation.userId);
      const normalizedHistory = history.map((item) => ({ ...item, isMine: item.senderId === user?.id }));
      setMessages(normalizedHistory);

      await Promise.all(
        normalizedHistory
          .filter((item) => !item.isMine && !item.isRead)
          .map((item) => messageApi.markRead(item.id))
      );
    }

    loadMessages();
  }, [selectedConversation, user]);

  useEffect(() => {
    if (!chatSocket) {
      return undefined;
    }

    const handleIncomingMessage = (message) => {
      if (
        selectedConversation &&
        (message.senderId === selectedConversation.userId || message.receiverId === selectedConversation.userId)
      ) {
        setMessages((current) => [...current, { ...message, isMine: message.senderId === user?.id }]);
        if (message.receiverId === user?.id && message.senderId === selectedConversation.userId) {
          messageApi.markRead(message.id).catch(() => null);
        }
      }
    };

    chatSocket.on('receive_message', handleIncomingMessage);

    return () => {
      chatSocket.off('receive_message', handleIncomingMessage);
    };
  }, [chatSocket, selectedConversation, user]);

  if (loading) {
    return <LoadingSpinner label="Loading chat..." />;
  }

  const handleSend = async () => {
    if (!selectedConversation) {
      return;
    }

    if (!messageText.trim() && !uploadFile) {
      return;
    }

    let payload;
    let isMultipart = false;

    if (uploadFile) {
      payload = new FormData();
      payload.append('receiverId', selectedConversation.userId);
      payload.append('content', messageText);
      payload.append('file', uploadFile);
      isMultipart = true;
    } else {
      payload = {
        receiverId: selectedConversation.userId,
        content: messageText,
        messageType: 'TEXT'
      };
    }

    const message = await messageApi.send(payload, isMultipart);
    setMessages((current) => [...current, { ...message, isMine: true }]);
    setMessageText('');
    setUploadFile(null);
  };

  return (
    <section className="container page-stack">
      <div className="chat-layout section-card">
        <aside className="chat-sidebar">
          <div className="section-head">
            <div>
              <span className="eyebrow">Conversations</span>
              <h2>{user?.role === 'Customer' ? 'Support inbox' : 'Customer inbox'}</h2>
            </div>
            <BackButton fallbackTo={backTo || (user?.role === 'Customer' ? '/' : '/admin')} />
          </div>
          {conversationList.map((conversation) => (
            <button
              className={`chat-conversation ${selectedConversation?.userId === conversation.userId ? 'is-active' : ''}`}
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              type="button"
            >
              <strong>{conversation.fullName}</strong>
            </button>
          ))}
        </aside>
        {selectedConversation ? (
          <ChatWindow
            messages={messages}
            onClearFile={() => setUploadFile(null)}
            onChange={setMessageText}
            onSend={handleSend}
            onUpload={setUploadFile}
            selectedFile={uploadFile}
            value={messageText}
          />
        ) : (
          <EmptyState
            description="No chat partner is available yet. Create at least one active Staff or Admin account, or run the backend seed to add sample support users."
            title="Chat is ready, but there is no support account to talk to"
          />
        )}
      </div>
    </section>
  );
}

export default ChatPage;
