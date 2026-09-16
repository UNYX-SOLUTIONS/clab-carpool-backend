export interface InstitutionProps {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Institution {
  private constructor(private readonly props: InstitutionProps) {}

  static create(props: InstitutionProps): Institution {
    return new Institution(props);
  }

  toJSON(): InstitutionProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get domain(): string {
    return this.props.domain;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
