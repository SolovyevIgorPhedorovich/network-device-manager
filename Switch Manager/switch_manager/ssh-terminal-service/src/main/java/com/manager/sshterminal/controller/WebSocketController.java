package com.manager.sshterminal.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.jcraft.jsch.JSchException;
import com.manager.sshterminal.service.SSHService;

@Controller
public class WebSocketController {

	@Autowired
	private SSHService sshService;

	@MessageMapping("/ssh.connect")
    @SendTo("/topic/ssh.response")
    public String connectSSH(String credentials) {
        try {
            String[] parts = credentials.split(":");
            String host = parts[0];
            int port = Integer.parseInt(parts[1]);
            String username = parts[2];
            String password = parts[3];

            sshService.connect(host, port, username, password);
            return "SSH connection established.";
        } catch (JSchException | IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @MessageMapping("/ssh.command")
    @SendTo("/topic/ssh.response")
    public void handleCommand(String command) throws Exception {
        sshService.sendCommand(command);
    }

    @MessageMapping("/ssh.signal")
    @SendTo("/topic/ssh.response")
    public void handleSignal(String signal) throws Exception {
        sshService.sendSignal(signal);
    }

}
