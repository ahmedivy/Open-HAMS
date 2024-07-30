import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetProps {
  resetLink?: string;
}

export const PasswordResetEmail = ({
  resetLink: resetCode,
}: PasswordResetProps) => (
  <Html>
    <Head />
    <Preview>Password Change Request</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Password Change Request</Heading>
        <Text style={{ ...text, marginBottom: "14px" }}>
          Someone recently requested a password change for your OpenHAMS
          account. If this was you, you can set a new password here:
        </Text>
        <Button style={button} href={resetCode}>
          Reset password
        </Button>
        <Text
          style={{
            ...text,
            color: "#ababab",
            marginTop: "14px",
            marginBottom: "16px",
          }}
        >
          If you didn&apos;t try to reset your password, you can safely ignore
          this email.
        </Text>
        <Img
          src={`https://open-hams-three.vercel.app/logo.png`}
          width="32"
          height="32"
          alt="OpenHAMS's Logo"
        />
        <Text style={footer}>
          <Link
            href="https://openhams.com"
            target="_blank"
            style={{ ...link, color: "#898989" }}
          >
            OpenHAMS
          </Link>
          <br />A opensource animal and event management dashboard
        </Text>
      </Container>
    </Body>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  resetLink: "{resetLink}",
} as PasswordResetProps;

export default PasswordResetEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const button = {
  backgroundColor: "#98FC98",
  borderRadius: "4px",
  color: "#000",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const footer = {
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};

const code = {
  display: "inline-block",
  padding: "16px 4.5%",
  width: "90.5%",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
};
