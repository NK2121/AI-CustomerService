"use client";

import React, { useState, useEffect } from 'react';
import { useSession, getSession, signIn } from 'next-auth/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

export default function Home() {
  const { data: session, status } = useSession();
  const theme = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the EthioLink Support Agent, how can I assist you today?",
    }
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session) signIn(); // If not authenticated, force sign in
  }, [session, status]);

  if (!session) {
    return <p>Loading...</p>; // Loading state or redirect to sign-in
  }

  const sendMessage = async () => {
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
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: '#e9eef3', padding: '20px' }}
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid #ccc"
        borderRadius="12px"
        p={2}
        spacing={2}
        sx={{
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.primary.main} transparent`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '10px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={
              message.role === 'assistant' ? 'flex-start' : 'flex-end'
            }
            mb={2}
          >
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: message.role === 'assistant'
                  ? theme.palette.primary.light
                  : theme.palette.secondary.light,
                color: message.role === 'assistant'
                  ? theme.palette.primary.contrastText
                  : theme.palette.secondary.contrastText,
                borderRadius: '18px',
                padding: '14px 20px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                fontSize: '16px',
                lineHeight: '1.6',
                wordWrap: 'break-word',
              }}
            >
              {message.content}
            </Box>
          </Box>
        ))}
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        mt={2}
        sx={{ width: '600px', borderRadius: '12px', backgroundColor: '#fff' }}
      >
        <TextField
          label="Type a message..."
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            borderRadius: '18px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '18px',
            },
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendMessage}
          sx={{
            borderRadius: '18px',
            padding: '10px 24px',
            fontSize: '16px',
            backgroundColor: theme.palette.primary.main,
            textTransform: 'none',
          }}
        >
          Send
        </Button>
      </Stack>
    </Box>
  );
}
//This is the main page
