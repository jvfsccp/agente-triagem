import type { SendMessageRequest, Conversation } from '../types/message';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async sendMessage(data: SendMessageRequest): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao enviar mensagem');
    }

    const result = await response.json();
    
    // Converter strings de data para objetos Date
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      messages: result.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    };
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/messages/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar conversa');
    }

    const result = await response.json();
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      messages: result.messages.map((msg: any) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    };
  }
}

export const apiService = new ApiService();
