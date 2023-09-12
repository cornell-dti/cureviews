import { OAuth2Client } from "google-auth-library";

export const verifyTicket = (token: string, audience: string) => {
  const client = new OAuth2Client(audience);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience,
  });

  return ticket.getPayload();
};
