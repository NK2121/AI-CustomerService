"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';
import HearForYouLogo from './image.svg'; // Assuming you have a logo component or import

const BackgroundContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(to bottom right, #8EC5FC, #E0C3FC)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  overflow: 'hidden',
});

const ChatBox = styled(Stack)({
  width: '100%',
  maxWidth: '600px',
  height: '60%',
  borderRadius: '20px',
  padding: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: '#5A5A5A transparent',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#5A5A5A',
    borderRadius: '10px',
  },
});

const MessageContainer = styled(Box)(({ role }) => ({
  display: 'flex',
  justifyContent: role === 'assistant' ? 'flex-start' : 'flex-end',
  marginBottom: '16px',
}));

const MessageBubble = styled(Box)(({ role, theme }) => ({
  maxWidth: '75%',
  backgroundColor: role === 'assistant' ? '#f1f0ff' : '#daf5db',
  color: role === 'assistant' ? '#000000' : '#000000',
  borderRadius: '20px',
  padding: '14px 20px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  fontSize: '16px',
  lineHeight: '1.6',
  wordWrap: 'break-word',
}));

const InputContainer = styled(Stack)({
  width: '100%',
  maxWidth: '600px',
  borderRadius: '30px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginTop: '20px',
  padding: '10px',
  alignItems: 'center',
});

export default function Home() {
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the HearForYou Support Agent. How can I assist you today?",
    }
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (message.trim() === '') return;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';

    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }

      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      result += text;

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text, // Concatenate new text with the existing content
          },
        ];
      });

      return reader.read().then(processText);
    });
  };

  return (
    <BackgroundContainer>
      <Box textAlign="center" mb={3}>
        <img src={HearForYouLogo} alt="HearForYou Logo" style={{ width: '100px', height: 'auto' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffffff', marginTop: '10px' }}>
          HearForYou Support Chat
        </Typography>
      </Box>
      <ChatBox spacing={2}>
        {messages.map((message, index) => (
          <MessageContainer key={index} role={message.role}>
            <MessageBubble role={message.role} theme={theme}>
              {message.content}
            </MessageBubble>
          </MessageContainer>
        ))}
      </ChatBox>

      <InputContainer direction="row" spacing={2}>
        <TextField
          label="Type a message..."
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            borderRadius: '30px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              padding: '10px',
            },
            '& .MuiInputLabel-root': {
              fontSize: '14px',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          sx={{
            borderRadius: '30px',
            padding: '10px 24px',
            fontSize: '16px',
            backgroundColor: theme.palette.primary.main,
            textTransform: 'none',
            minWidth: '80px',
          }}
        >
          Send
        </Button>
      </InputContainer>
    </BackgroundContainer>
  );
}
