import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
interface UseWebSocketProps {
	brokerURL: string;
	onConnect?: string[];
	onMessage?: (message: any) => void;
	subscribeTo?: string;
}

const useWebSocket = ({ brokerURL, onConnect, onMessage, subscribeTo } : UseWebSocketProps) => {
	const stompClient = useRef<any>(null);
    const socket = useRef<any>(null);

    useEffect(() => {
        if (stompClient.current) {
            return; // Если подключение уже установлено, выходим
        }

        // Создание WebSocket-клиента
        socket.current = new SockJS(brokerURL);
        stompClient.current = over(socket.current);
        
        stompClient.current.connect({}, () => {
            console.log("WebSocket connected");
            if (onConnect) stompClient.current.send(onConnect[0], {}, onConnect[1]);

            // Подписка к WebSocket
            if (subscribeTo) {
                stompClient.current.subscribe(subscribeTo, (message: any) => {
                    if (onMessage) onMessage(message);
                });
            }

            // Обновляем состояние с новым stompClient
            return stompClient.current;
        }, (error: any) => {
            console.error("WebSocket connection error:", error);
        });

        // Очистка при размонтировании
        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect(() => {
                    console.log("WebSocket disconnected");
					return stompClient.current;
                });
            }
        };

    }, [brokerURL, onConnect, onMessage, subscribeTo, stompClient]);

    // Возврат stompClient для отправки сообщений
    return stompClient.current;
};

export default useWebSocket;