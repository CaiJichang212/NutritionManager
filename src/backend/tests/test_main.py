from fastapi.testclient import TestClient


class TestHealthCheck:
    def test_root_endpoint(self, client):
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "营养管理API服务"
        assert data["version"] == "1.0.0"

    def test_health_check(self, client):
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
