@echo off
echo ================================
echo Testando CofreKeys API
echo ================================
echo.

echo [1/5] Testando Health Check...
curl -s http://localhost:3000/health
echo.
echo.

echo [2/5] Registrando novo usuario...
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Teste User\",\"email\":\"teste@example.com\",\"password\":\"senha123\"}" ^
  -o response.json -s -w "\nStatus: %%{http_code}\n"
type response.json
echo.
echo.

echo [3/5] Fazendo login...
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"teste@example.com\",\"password\":\"senha123\"}" ^
  -o login.json -s -w "\nStatus: %%{http_code}\n"
type login.json
echo.
echo.

echo [4/5] Extraindo token...
for /f "tokens=2 delims=:," %%a in ('type login.json ^| findstr /C:"\"token\""') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%
echo Token: %TOKEN%
echo.

echo [5/5] Criando uma senha...
curl -X POST http://localhost:3000/api/passwords ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -d "{\"title\":\"YouTube Canal\",\"password\":\"minhaSenha123\",\"description\":\"Senha do canal principal do YouTube\"}" ^
  -s -w "\nStatus: %%{http_code}\n"
echo.
echo.

echo [6/6] Listando senhas...
curl -X GET http://localhost:3000/api/passwords ^
  -H "Authorization: Bearer %TOKEN%" ^
  -s
echo.
echo.

echo ================================
echo Teste concluido!
echo ================================
del response.json login.json 2>nul
