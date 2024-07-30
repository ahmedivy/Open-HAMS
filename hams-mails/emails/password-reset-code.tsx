import {
  Body,
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
  resetCode?: string;
}

export const PasswordResetEmail = ({ resetCode }: PasswordResetProps) => (
  <Html>
    <Head />
    <Preview>Password Reset Code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Passord Code</Heading>
        <Text style={{ ...text, marginBottom: "14px" }}>
          Use the following code to reset your password.
        </Text>
        <code style={code}>{resetCode}</code>
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
  resetCode: "{resetCode}",
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
