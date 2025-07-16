#!/usr/bin/env bash
# Healing script: touch a dummy file to trigger redeploy
DUMMY=redeploy-$(date +%s)
touch $DUMMY
rm $DUMMY

echo "Triggered redeploy by touching $DUMMY" 