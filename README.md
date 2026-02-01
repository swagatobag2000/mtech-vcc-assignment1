# Multi-VM Microservice Deployment using VirtualBox

## Project Overview
The objective of this assignment is to create and configure multiple Virtual Machines (VMs) using VirtualBox, establish network connectivity between them, and deploy a microservice-based application across the connected VMs. 

The setup uses **Ubuntu Server 22.04.5 LTS**, a **Node.js REST API**, and **MongoDB**, deployed in a distributed manner to showcase inter-VM communication.

---

## Architecture Summary

- **vm-service**: Hosts the Node.js + Express REST API and MongoDB
- **vm-client**: Acts as a client consuming the REST API using HTTP requests

### Network Design
Each VM is configured with two network adapters:
- **Adapter 1 (NAT)** – Internet access for package installation
- **Adapter 2 (Internal Network)** – Private VM-to-VM communication

Static IPs are assigned on the Internal Network:
- vm-service → `192.168.100.10`
- vm-client → `192.168.100.11`

---

### Network Configuration (Netplan)

```bash
sudo nano /etc/netplan/50-cloud-init.yaml
```

Configuring static IPs on the Internal Network interface (`enp0s8`).

**vm-service (`192.168.100.10`)**
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
    enp0s8:
      dhcp4: false
      addresses:
        - 192.168.100.10/24
```

**vm-client (`192.168.100.11`)**
```yaml
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
    enp0s8:
      dhcp4: false
      addresses:
        - 192.168.100.11/24
```

Apply configuration:
```bash
sudo netplan generate
sudo netplan apply
```

---

### MongoDB Installation (vm-service)

MongoDB is installed using the official MongoDB repository (Ubuntu 22.04 does not include MongoDB server by default).

```bash
sudo apt install -y curl gnupg
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

### Node.js & Microservice Setup (vm-service)

Install Node.js 18 LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Install dependencies and start the API:
```bash
cd microservice
npm install
node index.js
```

The API listens on port **3000** and exposes a `/health` endpoint.

---

### Testing from Client VM

From **vm-client**:
```bash
curl http://192.168.100.10:3000/health
```

Expected response:
```json
{
  "status": "Microservice Running Successfully",
  "server": "vm-service",
  "ip": "192.168.100.10"
}
```

---
