import * as Diff3 from 'node-diff3';  

export const compareWriting = (firstWriting: string, lastWriting: string) => {
    const w1 = firstWriting.split(' ');
    const w2 = lastWriting.split(' ');
    const patches = Diff3.diffPatch(w1, w2);
    const id = Math.random().toString(36).substring(2, 15);
    let key_index = 0;

    // just a local array for React elements
    const result: React.ReactNode[] = [];
    let start_index = 0;

    patches.map((patch) => {
        const { buffer1, buffer2 } = patch;
        if (start_index < buffer2.offset) {
        result.push(
            <span key={`unchanged-${id}-${key_index++}`}>{w2.slice(start_index, buffer2.offset).join(' ')}</span>
        );
        start_index = buffer2.offset;
        }
        result.push(<span key={`space-${id}-${key_index++}`}> </span>);
        result.push(
        <span key={`added-${id}-${key_index++}`} className="text-green-500 font-bold">
            { w2.slice(buffer2.offset, buffer2.offset + buffer2.length).join(' ') }
        </span>
        );

        result.push(<span key={`space-${id}-${key_index++}`}> </span>);
        result.push(
        <span key={`removed-${id}-${key_index++}`} className="text-red-500 line-through">
            { w1.slice(buffer1.offset, buffer1.offset + buffer1.length).join(' ') }
        </span>
        );
        result.push(<span key={`space-${id}-${key_index++}`}> </span>);
        start_index = start_index + buffer2.length;
    });

    if (start_index < w2.length) {
        result.push(<span key={`space-${id}-${key_index++}`}> </span>);
        result.push(
        <span key={`unchanged-${id}-${key_index++}`}>{w2.slice(start_index).join(' ')}</span>
        );
    }

    return <span>{result}</span>;
};