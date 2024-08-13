"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

export default function Home() {
    const theme = useTheme();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm the EthioLink Support Agent, how can I assist you today?",
        }
    ]);
    const [message, setMessage] = useState('');

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
        >
            <Stack
                direction="column"
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={2}
            >
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        display="flex"
                        justifyContent={
                            message.role === 'assistant' ? 'flex-start' : 'flex-end'
                        }
                    >
                        <Box
                            sx={{
                                bgcolor: message.role === 'assistant'
                                    ? theme.palette.primary.main
                                    : theme.palette.secondary.main,
                                color: 'white',
                                borderRadius: 16,
                                p: 3,
                            }}
                        >
                            {message.content}
                        </Box>
                    </Box>
                ))}
            </Stack>

            <Stack direction="row" spacing={2}>
                <TextField
                    label="Message"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" onClick={sendMessage}>Send</Button>
            </Stack>
        </Box>
    );
}
