declare module 'react-quill' {
  import { Component } from 'react';
  
  export interface UnprivilegedEditor {
    getLength(): number;
    getText(index?: number, length?: number): string;
    getHTML(): string;
    getBounds(index: number, length?: number): Bounds;
    getSelection(focus?: boolean): Range;
    getContents(index?: number, length?: number): Delta;
  }
  
  export interface Bounds {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }
  
  export interface Range {
    index: number;
    length: number;
  }
  
  export interface Delta {
    ops: any[];
    insert(value: any): Delta;
    delete(length: number): Delta;
    retain(length: number): Delta;
    length(): number;
  }
  
  export interface QuillOptions {
    debug?: string | boolean;
    modules?: any;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    formats?: string[];
    bounds?: HTMLElement | string;
    scrollingContainer?: HTMLElement | string;
    strict?: boolean;
  }
  
  export interface ReactQuillProps {
    bounds?: string | HTMLElement;
    defaultValue?: string;
    formats?: string[];
    id?: string;
    modules?: any;
    onChange?: (content: string, delta: Delta, source: string, editor: UnprivilegedEditor) => void;
    onChangeSelection?: (range: Range | null, source: string, editor: UnprivilegedEditor) => void;
    onFocus?: (range: Range, source: string, editor: UnprivilegedEditor) => void;
    onBlur?: (previousRange: Range, source: string, editor: UnprivilegedEditor) => void;
    onKeyDown?: React.EventHandler<any>;
    onKeyPress?: React.EventHandler<any>;
    onKeyUp?: React.EventHandler<any>;
    placeholder?: string;
    readOnly?: boolean;
    scrollingContainer?: string | HTMLElement;
    style?: React.CSSProperties;
    tabIndex?: number;
    theme?: string;
    value?: string | any;
    preserveWhitespace?: boolean;
  }
  
  export default class ReactQuill extends Component<ReactQuillProps> {
    focus(): void;
    blur(): void;
    getEditor(): any;
    getEditingArea(): HTMLElement;
    getHTML(): string;
    getLength(): number;
    getText(): string;
    getBounds(index: number, length?: number): Bounds;
    getSelection(focus?: boolean): Range;
    getContents(): Delta;
    setContents(delta: any): Delta;
    updateContents(delta: any): Delta;
    setText(text: string): Delta;
    deleteText(index: number, length: number): Delta;
    format(name: string, value: any, source?: string): Delta;
    formatLine(index: number, length: number, formats: any): Delta;
    formatText(index: number, length: number, formats: any): Delta;
    insertText(index: number, text: string, formats?: any, source?: string): Delta;
    insertEmbed(index: number, type: string, value: any, source?: string): Delta;
    removeFormat(index: number, length: number): Delta;
    getFormat(range?: any): any;
  }
}
