export interface MessageProps {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: Date | null;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Message {
  private constructor(private readonly props: MessageProps) {}

  static create(props: MessageProps): Message {
    return new Message(props);
  }

  toJSON(): MessageProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get chatId(): string {
    return this.props.chatId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get content(): string {
    return this.props.content;
  }

  get type(): string {
    return this.props.type;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get readAt(): Date | null | undefined {
    return this.props.readAt;
  }

  get sentAt(): Date {
    return this.props.sentAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
