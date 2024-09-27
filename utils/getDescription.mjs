export default function getDescription(text) {
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.startsWith('Descrição:')) {
            return line.substring('Descrição:'.length).trim();
        }
    }
    return '';
}