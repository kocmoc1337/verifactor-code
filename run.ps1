# Запуск verifactor-code (TUI) из исходников.
# Кэш Bun и временные файлы держим на G:, потому что на C: мало места.
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
$env:BUN_INSTALL_CACHE_DIR = 'G:\.bun-cache'
$env:TEMP = 'G:\.tmp'
$env:TMP = 'G:\.tmp'
# Открываем проект в той папке, откуда запустили команду, а не в папке репозитория.
$project = (Get-Location).Path
Push-Location $PSScriptRoot
try {
  bun run --cwd packages/cli src/index.ts $project @args
} finally {
  Pop-Location
}
