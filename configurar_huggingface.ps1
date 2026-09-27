$ErrorActionPreference = 'Stop'
$rutaConfiguracion = Join-Path $PSScriptRoot '.env'
try {
    if (-not (Test-Path -LiteralPath $rutaConfiguracion)) {
        throw 'No se encontro .env con la configuracion Gemini. No se hicieron cambios.'
    }
    $configuracionActual = [IO.File]::ReadAllText($rutaConfiguracion)
    if ($configuracionActual -match '(?m)^\s*HF_TOKEN\s*=') {
        Write-Host 'Ya existe HF_TOKEN. No se cambia el token guardado.'
        return
    }
    Write-Host 'El token se guarda en .env, excluido de Git. No se muestra ni se envia al chat.'
    Write-Host 'Se conserva la configuracion Gemini. Este paso no consulta ninguna API.'
    $confirmacionHF = Read-Host 'Confirma cuenta gratuita, sin creditos comprados, recargas ni claves de proveedores externos configuradas (SI)'
    if ($confirmacionHF -ne 'SI') { return }
    $secretoHF = Read-Host 'Pega SOLO el token Hugging Face y pulsa Enter (entrada oculta)' -AsSecureString
    $punteroHF = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretoHF)
    try {
        $tokenLocalHF = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($punteroHF).Trim()
        if ($tokenLocalHF -notmatch '^hf_[A-Za-z0-9]{10,}$') {
            Write-Host 'Formato no reconocido. No se guardo nada. Copia solo el token completo.'
            return
        }
        $nuevaConfiguracion = $configuracionActual.TrimEnd() + "`nHF_TOKEN='$tokenLocalHF'`nHF_FREE_CREDITS_ONLY_CONFIRMED=true`n"
        [IO.File]::WriteAllText($rutaConfiguracion, $nuevaConfiguracion, [Text.UTF8Encoding]::new($false))
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($punteroHF)
        $secretoHF.Dispose()
        $tokenLocalHF = $null
        $nuevaConfiguracion = $null
        $configuracionActual = $null
    }
    Write-Host 'Token Hugging Face guardado. Gemini conservado. No se realizaron llamadas API.'
} catch {
    Write-Host 'No se pudo completar la configuracion. No compartas el contenido de .env.'
} finally {
    Read-Host 'Pulsa Enter para cerrar'
}
