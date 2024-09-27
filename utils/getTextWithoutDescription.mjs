export default function getTextWithoutDescription(text) {
    const lines = text.split('\n');
    const resultLines = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith('descrição:')) {
            continue;
        }
        resultLines.push(line);
    }
    return resultLines.join('\n').trim();
}
