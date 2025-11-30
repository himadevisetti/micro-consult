declare module "passport-azure-ad-oauth2" {
  import { Strategy as PassportStrategy } from "passport";
  export default class OAuth2Strategy extends PassportStrategy {
    constructor(
      options: {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
      },
      verify: (
        accessToken: string,
        refreshToken: string,
        params: any,
        profile: any,
        done: (err: any, user?: any) => void
      ) => void
    );
  }
}

