import json
import os

transcript_path = r'C:\Users\golor\.gemini\antigravity\brain\3ed2560a-5f98-4973-884c-3fe11b5cfbff\.system_generated\logs\transcript.jsonl'

changes = []
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            step = json.loads(line)
            if step.get('type') == 'PLANNER_RESPONSE':
                for tool_call in step.get('tool_calls', []):
                    if tool_call.get('name') == 'replace_file_content':
                        args = tool_call.get('args', {})
                        tgt_file = args.get('TargetFile', '')
                        if tgt_file.startswith('"'):
                            tgt_file = json.loads(tgt_file)
                        if 'task.md' not in tgt_file:
                            changes.append(args)
        except Exception as e:
            pass

def clean_path(p):
    if p.startswith('"') and p.endswith('"'):
        try:
            p = json.loads(p)
        except:
            p = p[1:-1]
    return p

files_changed = set()
for c in changes:
    files_changed.add(clean_path(c.get('TargetFile', '')))

def normalize(s):
    return s.replace('\r\n', '\n')

def reverse_changes(filepath):
    if not filepath or not os.path.exists(filepath):
        print(f'File {filepath} not found')
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = normalize(content)
    file_changes = [c for c in changes if clean_path(c.get('TargetFile', '')) == filepath]
    
    for c in reversed(file_changes):
        target = c.get('ReplacementContent', '')
        replacement = c.get('TargetContent', '')
        
        if target.startswith('"'):
            target = json.loads(target)
        if replacement.startswith('"'):
            replacement = json.loads(replacement)
            
        target = normalize(target)
        replacement = normalize(replacement)
        
        if target and target in content:
            content = content.replace(target, replacement, 1)
        else:
            print('Could not find target to reverse in', os.path.basename(filepath), ':', repr(target)[:50])
            
    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'Reverted {filepath}')

for f in files_changed:
    reverse_changes(f)
