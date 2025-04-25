import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  ListOrdered,
  Image,
  Link,
  Square
} from 'lucide-react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor with value
  useEffect(() => {
    if (editorRef.current) {
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // Save content when it changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Format actions
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatHeading = () => {
    // Insert a heading tag
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        execCommand('insertHTML', `<h3 class="text-xl font-semibold mb-3">${selectedText}</h3>`);
      } else {
        execCommand('insertHTML', '<h3 class="text-xl font-semibold mb-3">Novo título</h3>');
      }
    } else {
      execCommand('insertHTML', '<h3 class="text-xl font-semibold mb-3">Novo título</h3>');
    }
  };

  const formatBulletList = () => execCommand('insertUnorderedList');
  const formatNumberedList = () => execCommand('insertOrderedList');

  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="Imagem" class="max-w-full h-auto rounded my-2" />`);
    }
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertButton = () => {
    const buttonText = prompt('Digite o texto do botão:') || 'Botão';
    const buttonUrl = prompt('Digite a URL do botão (deixe em branco para nenhuma):') || '#';
    execCommand('insertHTML', `<a href="${buttonUrl}" class="inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 my-2">${buttonText}</a>`);
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 p-2 flex items-center flex-wrap" role="toolbar">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatBold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatItalic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatUnderline}
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 text-gray-300">|</div>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatHeading}
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatBulletList}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={formatNumberedList}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <div className="mx-2 text-gray-300">|</div>
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={insertImage}
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={insertLink}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 mr-1" 
          onClick={insertButton}
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-3 outline-none overflow-y-auto"
        onInput={handleContentChange}
        onBlur={handleContentChange}
      />
    </div>
  );
};

export default TextEditor;
