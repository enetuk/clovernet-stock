type KeyValue = { key: string, value: string };

const boldify = ({key, value}: KeyValue) => {
    return `<b>${key}</b>: ${value}`;
}

export const boldedList = (data: Record<string, any>, keyMapper: Record<string, string>) => {
    return Object.entries(data).map(([key, value]) => ({key: keyMapper[key], value: String(value)})).map(boldify).join('\n');
}