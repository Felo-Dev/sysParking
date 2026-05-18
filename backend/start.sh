#!/bin/bash
export LD_LIBRARY_PATH=/tmp/php-pgsql-extract:$LD_LIBRARY_PATH
PHP_INI=/tmp/php-pgsql-extract/php.ini

echo "🚀 Iniciando sysParking Backend en http://0.0.0.0:8000"
exec php -c "$PHP_INI" -S 0.0.0.0:8000 -t public/ router.php
