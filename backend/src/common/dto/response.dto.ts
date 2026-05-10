export class SuccessResponseDto<T> {
  success: boolean = true;
  data: T;
}

export class ErrorResponseDto {
  success: boolean = false;
  error: string;
  errors?: Record<string, string>;
}

