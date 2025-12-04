FROM node:22-bookworm

# Install Chrome (Debian-compatible, modern keyring)
RUN apt-get update && apt-get install -y wget gnupg ca-certificates \
  && mkdir -p /etc/apt/keyrings \
  && wget -q -O- https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/keyrings/google-chrome.gpg \
  && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update && apt-get install -y google-chrome-stable \
  && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/google-chrome

# Install Python 3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

# Create a virtual environment and install required Python packages
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --upgrade pip \
  && /opt/venv/bin/pip install PyMuPDF pdf2docx

# Set environment variables to use the venv explicitly
ENV VIRTUAL_ENV=/opt/venv
ENV PYTHON_BIN=/opt/venv/bin/python3

# Install and configure SSH + CLI enhancements
RUN apt-get update && apt-get install -y openssh-server bash-completion less vim \
  && mkdir -p /var/run/sshd || true \
  && echo 'root:Docker!' | chpasswd \
  && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
  && echo 'source /etc/bash_completion' >> /root/.bashrc \
  && echo 'export PS1="\u@\h:\w\$ "' >> /root/.bashrc

# Expose SSH port for Azure binding
EXPOSE 2222

# Set working directory
WORKDIR /app

# Copy root manifest and install runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server files
COPY expert-snapshot-legal/frontend/build/devServer.mjs ./
COPY expert-snapshot-legal/frontend/build/patch-path-to-regexp.js ./
COPY expert-snapshot-legal/frontend/build/telemetry/telemetryClient.js /app/telemetryClient.js
COPY expert-snapshot-legal/frontend/build/track.js /app/track.js

# Copy frontend build output
COPY expert-snapshot-legal/frontend/build/frontend ./frontend
COPY expert-snapshot-legal/frontend/build/src ./src

# Create scripts directory and copy shim
RUN mkdir -p /app/scripts
COPY expert-snapshot-legal/scripts /app/scripts

# Start SSH and your app server
CMD ["sh", "-c", "service ssh start && node devServer.mjs"]

