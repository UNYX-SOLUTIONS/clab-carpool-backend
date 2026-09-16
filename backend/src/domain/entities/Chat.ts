export interface ChatProps {
  id: string;
  travelId: string;
  user1Id: string;
  user1Name?: string;
  user2Id: string;
  user2Name?: string;
  isActive: boolean;
  lastMessageAt?: Date | null;
  lastMessage?: string | null;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Chat {
  private constructor(private readonly props: ChatProps) {}

  static create(props: ChatProps): Chat {
    return new Chat(props);
  }

  toJSON(): ChatProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get travelId(): string {
    return this.props.travelId;
  }

  get user1Id(): string {
    return this.props.user1Id;
  }

  get user1Name(): string | undefined {
    return this.props.user1Name;
  }

  get user2Id(): string {
    return this.props.user2Id;
  }

  get user2Name(): string | undefined {
    return this.props.user2Name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastMessageAt(): Date | null | undefined {
    return this.props.lastMessageAt;
  }

  get lastMessage(): string | null | undefined {
    return this.props.lastMessage;
  }

  get unreadCount(): number | undefined {
    return this.props.unreadCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  otherUserId(currentUserId: string): string {
    return this.props.user1Id === currentUserId
      ? this.props.user2Id
      : this.props.user1Id;
  }

  isParticipant(userId: string): boolean {
    return this.props.user1Id === userId || this.props.user2Id === userId;
  }
}
