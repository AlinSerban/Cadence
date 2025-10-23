export type User = {
  id: number;
  full_name: string;
  email: string;
  username: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export type RegisterModalProps = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginModalProps = {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
};
