import fs from 'fs';
import path from 'path';

export default function getLastContentFolder(dirPath) {
    // Lê o diretório e obtém todos os arquivos/pastas
    const items = fs.readdirSync(dirPath);

    // Filtra apenas as pastas que começam com 'content_'
    const contentFolders = items
        .filter(item => item.startsWith('content_') && fs.lstatSync(path.join(dirPath, item)).isDirectory());

    if (contentFolders.length === 0) {
        return null; // Nenhuma pasta encontrada
    }

    // Ordena as pastas por nome
    contentFolders.sort((a, b) => a.localeCompare(b));

    // Retorna a última pasta
    return contentFolders[contentFolders.length - 1];
}
