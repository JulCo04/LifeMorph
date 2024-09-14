#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d api.lifemorph.site --nginx --agree-tos --email julcollazo02@gmail.com