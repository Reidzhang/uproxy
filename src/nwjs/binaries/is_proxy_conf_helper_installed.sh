#TODO: remove all trace

# Check owner
OWNER=$(stat -f %Su "$PROXY_CONF_HELPER_PATH")
if [[ "$OWNER" != 'root' ]]
then
  echo "false"
  exit 0;
fi

PERMISSIONS=$(stat -f %Sp "$PROXY_CONF_HELPER_PATH")
# TODO: this regex isn't really working.  How do I make the "w" optional?
# I should match any permissions that work (execute as sudo)
if [[ $PERMISSIONS =~ "-rwsr-sr-x" ]]
then
  echo "true"
else
  echo "false"
fi
