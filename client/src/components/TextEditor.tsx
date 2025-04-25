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
    // Opções de origem para a imagem
    const sourceOptions = [
      "Imagem de URL externa (exemplo: imgur.com/imagem.jpg)",
      "Inserir imagem por URL personalizada",
      "Cancelar"
    ];
    
    const sourceOption = prompt(
      `Escolha a origem da imagem (digite o número):\n` +
      `1. ${sourceOptions[0]}\n` +
      `2. ${sourceOptions[1]}\n` +
      `3. ${sourceOptions[2]}`
    );
    
    let url = '';
    
    switch (sourceOption) {
      case '1': // URL externa
        url = prompt('Digite a URL da imagem:') || '';
        if (url && !url.match(/^https?:\/\//)) {
          url = `http://${url}`;
        }
        break;
      
      case '2': // URL personalizada
        url = prompt('Digite a URL completa da imagem (inclua http:// ou https:// se necessário):') || '';
        break;
      
      default:
        // Não fazer nada/cancelar
        return;
    }
    
    if (url) {
      const altText = prompt('Digite um texto alternativo para a imagem (opcional):') || 'Imagem';
      const imageSize = prompt('Escolha o tamanho da imagem (pequena, média, grande) ou deixe em branco para automático:');
      
      let sizeClass = 'max-w-full';
      
      switch (imageSize?.toLowerCase()) {
        case 'pequena':
          sizeClass = 'max-w-[30%]';
          break;
        case 'média':
        case 'media':
          sizeClass = 'max-w-[60%]';
          break;
        case 'grande':
          sizeClass = 'max-w-[90%]';
          break;
      }
      
      execCommand('insertHTML', `<img src="${url}" alt="${altText}" class="${sizeClass} h-auto rounded my-2" />`);
    }
  };

  const insertLink = () => {
    // Opções de destino para escolher
    const targetOptions = [
      "Link para URL externa (exemplo: google.com)",
      "Link para uma página do site",
      "Link para enviar e-mail",
      "Cancelar"
    ];
    
    const targetOption = prompt(
      `Escolha o tipo de link (digite o número):\n` +
      `1. ${targetOptions[0]}\n` +
      `2. ${targetOptions[1]}\n` +
      `3. ${targetOptions[2]}\n` +
      `4. ${targetOptions[3]}`
    );
    
    let url = '';
    
    // Processar com base na escolha
    switch (targetOption) {
      case '1': // URL externa
        url = prompt('Digite a URL externa:') || '';
        if (url && !url.match(/^https?:\/\//)) {
          url = `http://${url}`;
        }
        if (url) {
          execCommand('createLink', url);
          // Definir o atributo target="_blank" para abrir em nova aba
          try {
            setTimeout(() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
                  const container = range.commonAncestorContainer as Element;
                  const links = container.querySelectorAll('a');
                  links.forEach((link: Element) => {
                    link.setAttribute('target', '_blank');
                  });
                } else if (range.commonAncestorContainer.parentElement) {
                  const links = range.commonAncestorContainer.parentElement.querySelectorAll('a');
                  links.forEach((link: Element) => {
                    link.setAttribute('target', '_blank');
                  });
                }
              }
            }, 100);
          } catch (error) {
            console.error('Erro ao definir target="_blank":', error);
          }
        }
        break;
      
      case '2': // Página interna
        const pagePath = prompt('Digite o caminho da página (exemplo: servicos, proxmox):');
        if (pagePath) {
          url = `/${pagePath}`;
          execCommand('createLink', url);
        }
        break;
      
      case '3': // Email
        const email = prompt('Digite o endereço de e-mail:');
        if (email) {
          url = `mailto:${email}`;
          execCommand('createLink', url);
        }
        break;
      
      default:
        // Não fazer nada/cancelar
        break;
    }
  };

  const insertButton = () => {
    const buttonText = prompt('Digite o texto do botão:') || 'Botão';

    // Opções de destino para escolher
    const targetOptions = [
      "Digite uma URL externa (exemplo: google.com)",
      "Botão para uma página do site",
      "Botão para enviar e-mail",
      "Botão sem link (decorativo)"
    ];
    
    const targetOption = prompt(
      `Escolha o tipo de link para o botão (digite o número):\n` +
      `1. ${targetOptions[0]}\n` +
      `2. ${targetOptions[1]}\n` +
      `3. ${targetOptions[2]}\n` +
      `4. ${targetOptions[3]}`
    );
    
    let buttonUrl = '#';
    let target = '';
    
    // Processar com base na escolha
    switch (targetOption) {
      case '1': // URL externa
        buttonUrl = prompt('Digite a URL externa:') || '#';
        if (buttonUrl !== '#' && !buttonUrl.match(/^https?:\/\//)) {
          buttonUrl = `http://${buttonUrl}`;
        }
        target = ' target="_blank"';
        break;
      case '2': // Página interna
        const pagePath = prompt('Digite o caminho da página (exemplo: servicos, proxmox):');
        if (pagePath) {
          buttonUrl = `/${pagePath}`;
        }
        break;
      case '3': // Email
        const email = prompt('Digite o endereço de e-mail:');
        if (email) {
          buttonUrl = `mailto:${email}`;
        }
        break;
      case '4': // Sem link
        buttonUrl = 'javascript:void(0)';
        break;
      default:
        // Se não escolher opção válida, usa link vazio
        buttonUrl = '#';
    }
    
    execCommand('insertHTML', `<a href="${buttonUrl}" class="inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 my-2"${target}>${buttonText}</a>`);
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
