import { useEffect, useMemo } from 'react';
import { formatDate, resolveAssetUrl } from '../../utils/format';

const attachmentNamePattern = /\.(avif|bmp|csv|docx?|gif|heic|jpe?g|pdf|png|pptx?|rar|svg|txt|webp|xlsx?|zip)$/i;

function shouldDisplayMessageText(message) {
  const content = message?.content?.trim();

  if (!content) {
    return false;
  }

  if (message?.fileUrl && attachmentNamePattern.test(content)) {
    return false;
  }

  return true;
}

function ChatWindow({ messages = [], selectedFile, value, onChange, onClearFile, onSend, onUpload }) {
  const filePreview = useMemo(
    () => (selectedFile && selectedFile.type?.startsWith('image/') ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((message) => {
          const attachmentUrl = message.fileUrl ? resolveAssetUrl(message.fileUrl) : '';
          const showText = shouldDisplayMessageText(message);
          const isImageAttachment = message.messageType === 'IMAGE' && attachmentUrl;

          return (
            <article
              className={`chat-message ${message.isMine ? 'is-mine' : ''}`}
              key={`${message.id}-${message.createdAt}`}
            >
              {showText ? <p>{message.content}</p> : null}
              {isImageAttachment ? (
                <a className="chat-attachment-link" href={attachmentUrl} target="_blank" rel="noreferrer">
                  <img alt="Chat attachment" className="chat-attachment" src={attachmentUrl} />
                </a>
              ) : null}
              {!isImageAttachment && attachmentUrl ? (
                <a className="chat-file-chip" href={attachmentUrl} target="_blank" rel="noreferrer">
                  View attachment
                </a>
              ) : null}
              <time className="chat-message-time" dateTime={message.createdAt}>
                {formatDate(message.createdAt)}
              </time>
            </article>
          );
        })}
      </div>
      {selectedFile ? (
        <div className="chat-upload-preview">
          {filePreview ? <img alt={selectedFile.name} className="chat-attachment-preview" src={filePreview} /> : null}
          <div className="chat-upload-actions">
            <p className="chat-upload-note">{filePreview ? 'Image ready to send' : 'Attachment ready to send'}</p>
            <button className="button button-ghost" onClick={onClearFile} type="button">
              Remove
            </button>
          </div>
        </div>
      ) : null}
      <div className="chat-composer">
        <input
          placeholder="Write a message..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend?.();
            }
          }}
        />
        <label className="button button-secondary">
          Attach
          <input hidden type="file" onChange={(event) => onUpload?.(event.target.files?.[0])} />
        </label>
        <button className="button button-primary" onClick={onSend} type="button">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
