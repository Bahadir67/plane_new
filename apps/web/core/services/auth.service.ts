// types
import { API_BASE_URL } from "@plane/constants";
import type { ICsrfTokenData, IEmailCheckData, IEmailCheckResponse } from "@plane/types";
// helpers
// services
import { APIService } from "@/services/api.service";

export class AuthService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  private async getCsrfToken(): Promise<string> {
    const data = await this.requestCSRFToken();
    const token = data?.csrf_token;
    if (!token) {
      throw new Error("CSRF token not found");
    }
    return token;
  }

  async requestCSRFToken(): Promise<ICsrfTokenData> {
    return this.get("/auth/get-csrf-token/")
      .then((response) => response.data)
      .catch((error) => {
        throw error;
      });
  }

  emailCheck = async (data: IEmailCheckData): Promise<IEmailCheckResponse> => {
    const csrfToken = await this.getCsrfToken();
    return this.post("/auth/email-check/", data, {
      headers: {
        "X-CSRFTOKEN": csrfToken,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  };

  async sendResetPasswordLink(data: { email: string }): Promise<any> {
    const csrfToken = await this.getCsrfToken();
    return this.post(`/auth/forgot-password/`, data, {
      headers: {
        "X-CSRFTOKEN": csrfToken,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async setPassword(token: string, data: { password: string }): Promise<any> {
    return this.post(`/auth/set-password/`, data, {
      headers: {
        "X-CSRFTOKEN": token,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async generateUniqueCode(data: { email: string }): Promise<any> {
    const csrfToken = await this.getCsrfToken();
    return this.post("/auth/magic-generate/", data, {
      headers: {
        "X-CSRFTOKEN": csrfToken,
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async signOut(baseUrl: string): Promise<any> {
    await this.requestCSRFToken().then((data) => {
      const csrfToken = data?.csrf_token;

      if (!csrfToken) throw Error("CSRF token not found");

      const form = document.createElement("form");
      const element1 = document.createElement("input");

      form.method = "POST";
      form.action = `${baseUrl}/auth/sign-out/`;

      element1.value = csrfToken;
      element1.name = "csrfmiddlewaretoken";
      element1.type = "hidden";
      form.appendChild(element1);

      document.body.appendChild(form);

      form.submit();
    });
  }
}
