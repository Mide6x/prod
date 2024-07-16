import { Alert, Button, Card, Flex, Form, Input, Spin, Typography } from "antd";
import { Link } from "react-router-dom";

import loginImage from "../assets/login.png";
import useLogin from "../hooks/useLogin";

const Login = () => {
  const { loading, error, loginUser } = useLogin();

  const handleLogin = async (values) => {
    await loginUser(values);
  };

  return (
    <Card className="form-container">
      <Flex gap="large" align="centers">
        {/* This for the Picture */}
        <Flex flex={1}>
          <img src={loginImage} className="auth-img" alt="Login" />
        </Flex>
        {/* This for the Registration Form */}
        <Flex vertical flex={1}>
          <Typography.Title level={3} strong className="title">
            Let&apos;s get you logged in! 😤
          </Typography.Title>
          <Typography.Text type="secondary" strong className="slogan">
            If you&apos;re here, I assume you work at Sabi.
          </Typography.Text>
          <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
            <Form.Item
              label="Sabi E-mail Address"
              name="email"
              rules={[
                {
                  required: true,
                  message: "We'll need your E-mail address, Pookie 👉👈",
                },
                {
                  type: "email",
                  message:
                    "That input does not look like an E-mail. Let's try that again?",
                },
              ]}
            >
              <Input size="large" placeholder="...and your E-mail" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "We kinda need a password to continue 🫢",
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Give us a strong password? 🥷🏿"
              />
            </Form.Item>

            {error && (
              <Alert
                description={error}
                type="error"
                showIcon
                closable
                className="alert"
              />
            )}
            <Form.Item>
              <Button
                type={`${loading ? "" : "primary"}`}
                htmlType="submit"
                size="large"
                className="btn"
              >
                {loading ? <Spin /> : "Sign In"}
              </Button>
            </Form.Item>
            <Form.Item>
              <Link to="/">
                <Button size="large" className="btn">
                  Create Account
                </Button>
              </Link>
            </Form.Item>
          </Form>
        </Flex>
      </Flex>
    </Card>
  );
};

export default Login;
