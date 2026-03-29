from fastapi.testclient import TestClient
from models import User


class TestAuthRegister:
    def test_register_with_phone_success(self, client, test_user_data):
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["access_token"]

    def test_register_without_phone_and_email(self, client):
        response = client.post("/api/auth/register", json={
            "password": "testpassword123"
        })
        
        assert response.status_code == 400
        assert "必须提供手机号或邮箱" in response.json()["detail"]

    def test_register_duplicate_phone(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        
        response = client.post("/api/auth/register", json=test_user_data)
        
        assert response.status_code == 400
        assert "该手机号已注册" in response.json()["detail"]

    def test_register_with_email(self, client):
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "testpassword123",
            "nickname": "emailuser"
        })
        
        assert response.status_code == 201
        assert "access_token" in response.json()


class TestAuthLogin:
    def test_login_with_phone_success(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        
        response = client.post("/api/auth/login", json={
            "phone": test_user_data["phone"],
            "password": test_user_data["password"]
        })
        
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_with_wrong_password(self, client, test_user_data):
        client.post("/api/auth/register", json=test_user_data)
        
        response = client.post("/api/auth/login", json={
            "phone": test_user_data["phone"],
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]

    def test_login_with_nonexistent_user(self, client):
        response = client.post("/api/auth/login", json={
            "phone": "99999999999",
            "password": "testpassword123"
        })
        
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]


class TestAuthMe:
    def test_get_current_user_without_token(self, client):
        response = client.get("/api/auth/me")
        
        assert response.status_code == 403

    def test_get_current_user_with_invalid_token(self, client):
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
