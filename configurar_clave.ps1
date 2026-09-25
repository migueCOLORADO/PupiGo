$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '.env'
if (Test-Path -LiteralPath $envPath) {
    Write-Host 'Ya existe .env. No se sobrescribe. Puedes editarlo localmente.'
    Read-Host 'Enter para cerrar'
    exit
}
Write-Host 'Esta clave se guarda solo en .env (excluido de Git). No se imprime ni se envia al chat.'
$confirmacion = Read-Host 'Confirma que tu proyecto aparece en Free tier y no tiene facturacion activada (escribe SI)'
if ($confirmacion -ne 'SI') { exit }
$secreto = Read-Host 'Pega tu clave Gemini (se oculta) y pulsa Enter' -AsSecureString
$puntero = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secreto)
try {
    $claveLocal = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($puntero).Trim()
    # No asumir un prefijo ni un alfabeto fijo: Google puede cambiar el formato.
    # Solo eliminar espacios exteriores y rechazar una entrada vacia o multilinea.
    if ($claveLocal.Length -lt 20 -or $claveLocal -match '[\s\p{C}]') {
        Write-Host 'No se guardo la clave. Copia solo la clave completa con el boton Copiar de Google AI Studio, sin etiquetas ni saltos de linea.'
        return
    }
    $claveEscapada = $claveLocal.Replace('\', '\\').Replace("'", "\'")
    $contenidoLocal = "GEMINI_API_KEY='$claveEscapada'`nGEMINI_TEXT_MODEL=gemini-3.1-flash-lite`nGEMINI_EMBEDDING_MODEL=gemini-embedding-001`nGEMINI_FREE_TIER_CONFIRMED=true`n"
    [IO.File]::WriteAllText($envPath, $contenidoLocal, [Text.UTF8Encoding]::new($false))
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($puntero)
    $claveLocal = $null
    $claveEscapada = $null
    $contenidoLocal = $null
    $secreto.Dispose()
}
Write-Host 'Clave guardada. No se realizaron llamadas a la API.'
Read-Host 'Enter para cerrar'
