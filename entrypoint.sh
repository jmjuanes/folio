#!/bin/sh
envsubst '${FOLIO_APPDIR} ${FOLIO_PORT} ${FOLIO_SERVER_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
envsubst '${FOLIO_APPDIR} ${FOLIO_SERVER_PORT}' < /etc/supervisord.conf.template > /etc/supervisord.conf

exec supervisord -c /etc/supervisord.conf
