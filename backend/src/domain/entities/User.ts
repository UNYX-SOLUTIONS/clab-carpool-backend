export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  institutionId: string;
  institutionName?: string;
  institutionDomain?: string;
  isVerified: boolean;
  isDriver: boolean;
  phone?: string | null;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  toJSON(): UserProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get institutionId(): string {
    return this.props.institutionId;
  }

  get institutionName(): string | undefined {
    return this.props.institutionName;
  }

  get institutionDomain(): string | undefined {
    return this.props.institutionDomain;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get isDriver(): boolean {
    return this.props.isDriver;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get photoUrl(): string | null | undefined {
    return this.props.photoUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  markVerified(): void {
    this.props.isVerified = true;
  }

  markAsDriver(): void {
    this.props.isDriver = true;
  }

  updateProfile(partial: Partial<Pick<UserProps, 'fullName' | 'phone' | 'photoUrl'>>): void {
    if (partial.fullName !== undefined) {
      this.props.fullName = partial.fullName;
    }
    if (partial.phone !== undefined) {
      this.props.phone = partial.phone;
    }
    if (partial.photoUrl !== undefined) {
      this.props.photoUrl = partial.photoUrl;
    }
  }
}
