pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'DOCKERHUB_NAMESPACE', defaultValue: 'your-dockerhub-username', description: 'Docker Hub namespace used for image tags')
    string(name: 'DOCKERHUB_CREDENTIALS_ID', defaultValue: 'dockerhub-creds', description: 'Jenkins credentials ID for Docker Hub login')
    booleanParam(name: 'PUSH_TO_DOCKERHUB', defaultValue: false, description: 'Push built images to Docker Hub')
    booleanParam(name: 'KEEP_STACK_RUNNING', defaultValue: true, description: 'Keep the compose stack running after the smoke test')
    string(name: 'BACKEND_PORT', defaultValue: '5000', description: 'Host port for the backend API')
    string(name: 'FRONTEND_PORT', defaultValue: '3000', description: 'Host port for the frontend app')
    string(name: 'VITE_API_URL', defaultValue: 'http://localhost:5000/api', description: 'Frontend build-time API URL')
  }

  environment {
    BACKEND_IMAGE = ''
    FRONTEND_IMAGE = ''
  }

  stages {
    stage('Prepare') {
      steps {
        script {
          env.BACKEND_IMAGE = "${params.DOCKERHUB_NAMESPACE}/skillsphere-backend"
          env.FRONTEND_IMAGE = "${params.DOCKERHUB_NAMESPACE}/skillsphere-frontend"
        }

        echo "Backend image: ${env.BACKEND_IMAGE}"
        echo "Frontend image: ${env.FRONTEND_IMAGE}"
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install and Verify') {
      steps {
        dir('backend') {
          sh 'npm ci'
          sh 'node --check index.js'
        }

        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker build -t "${BACKEND_IMAGE}:${BUILD_NUMBER}" -t "${BACKEND_IMAGE}:latest" ./backend'
        sh 'docker build --build-arg VITE_API_URL="${VITE_API_URL}" -t "${FRONTEND_IMAGE}:${BUILD_NUMBER}" -t "${FRONTEND_IMAGE}:latest" ./frontend'
        sh 'docker images | grep skillsphere || true'
      }
    }

    stage('Login and Push') {
      when {
        expression { return params.PUSH_TO_DOCKERHUB }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: params.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_TOKEN')]) {
          sh 'echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin'
          sh 'docker push "${BACKEND_IMAGE}:${BUILD_NUMBER}"'
          sh 'docker push "${BACKEND_IMAGE}:latest"'
          sh 'docker push "${FRONTEND_IMAGE}:${BUILD_NUMBER}"'
          sh 'docker push "${FRONTEND_IMAGE}:latest"'
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        sh '''#!/usr/bin/env bash
set -euo pipefail

cat > .env.jenkins <<EOF
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=skillsphere2024
MONGO_DB=skillsphere
JWT_SECRET=jenkins-build-secret-change-me
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
CLIENT_URL=http://localhost:${FRONTEND_PORT}
VITE_API_URL=${VITE_API_URL}
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER_NAME=skillsphere-uploads
EOF

docker compose --env-file .env.jenkins down -v || true
docker compose --env-file .env.jenkins up -d --build

echo 'Waiting for backend...'
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${BACKEND_PORT}/" >/dev/null; then
    echo 'Backend is ready'
    break
  fi
  sleep 2
done

echo 'Waiting for frontend...'
for i in $(seq 1 30); do
  if curl -fsS "http://localhost:${FRONTEND_PORT}/" >/dev/null; then
    echo 'Frontend is ready'
    break
  fi
  sleep 2
done

docker ps
'''
      }
    }

    stage('Smoke Test') {
      steps {
        sh 'curl -fsS http://localhost:${BACKEND_PORT}/'
        sh 'curl -fsS http://localhost:${FRONTEND_PORT}/'
      }
    }
  }

  post {
    success {
      echo 'Build completed successfully.'
      echo 'Use the Docker Compose deployment running on the Jenkins agent for screenshots and demo.'
    }
    failure {
      sh 'docker compose --env-file .env.jenkins logs --no-color || true'
    }
    always {
      script {
        if (!params.KEEP_STACK_RUNNING) {
          sh 'docker compose --env-file .env.jenkins down -v || true'
        }
      }
    }
  }
}