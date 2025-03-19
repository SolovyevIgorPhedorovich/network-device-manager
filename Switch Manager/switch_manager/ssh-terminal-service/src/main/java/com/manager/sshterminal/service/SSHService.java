package com.manager.sshterminal.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.jcraft.jsch.ChannelShell;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

@Service
public class SSHService {
	private Session session;
	private ChannelShell channel;
	private InputStream inputStream;
	private OutputStream outputStream;
	private SimpMessagingTemplate messagingTemplate; // Для отправки сообщений через WebSocket

	private int lengthCommand = 0;

    @Autowired
    public SSHService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

	public void connect(String host, int port, String username, String passwrod) throws JSchException, IOException {
		JSch jsch = new JSch();
		
		session = jsch.getSession(username, host, port);
		session.setPassword(passwrod);
		session.setConfig("StrictHostKeyChecking", "no"); //Отключате проверку ключей хоста

		session.connect();

		channel = (ChannelShell) session.openChannel("shell");
		channel.connect();

		inputStream = channel.getInputStream();
		outputStream = channel.getOutputStream();
		// Запуск асинхронного чтения
        startAsyncReading();
	}

	private void startAsyncReading() {
        new Thread(() -> {
            byte[] buffer = new byte[1024];
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    if (inputStream.available() > 0) {
						int bytesRead = inputStream.read(buffer);
						if (lengthCommand != 0) {
							lengthCommand -= 1;
							continue;
						}
                        if (bytesRead > 0) {
                            String output = new String(buffer, 0, bytesRead);
                            // Отправка данных через WebSocket
                            messagingTemplate.convertAndSend("/topic/ssh.response", output);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                    break;
                }
            }
        }).start();
    }

	public String readOutput() throws IOException {
		StringBuilder outputBuilder = new StringBuilder();
   		byte[] buffer = new byte[1024];
    	while (inputStream.available() > 0) {
        	int byteRead = inputStream.read(buffer);
        	if (byteRead == -1) {
            break; // Конец потока
        }
        outputBuilder.append(new String(buffer, 0, byteRead));
    }
    return outputBuilder.toString();
	}

	public void sendCommand(String command) throws IOException {
		lengthCommand = command.length() - 1;
		outputStream.write(command.getBytes());
		outputStream.flush();
	}

	public void sendSignal(String signal) throws IOException {
		outputStream.write(signal.getBytes());
		outputStream.flush();
	}

	public void disconnect() {
		if (channel != null) {
			channel.disconnect();
		}
		if (session != null) {
			session.disconnect();
		}
	}

	public InputStream getInputStream() {
		return inputStream;
	}

	public OutputStream getOutputStream() {
		return outputStream;
	}

}
