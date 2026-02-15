import { Form } from 'antd';
import { useMathJax } from '../../hooks/useMathJax';

interface MathJaxPreviewProps {
    form: any;
    name: string;
    placeholder?: string;
}

const MathJaxPreview = ({ form, name, placeholder = "No content to preview" }: MathJaxPreviewProps) => {
    // Attempt to watch the value, fallback to getFieldValue if useWatch returns undefined
    const watchedContent = Form.useWatch(name, form);
    const content = watchedContent !== undefined ? watchedContent : form.getFieldValue(name);
    
    useMathJax(content);

    return (
        <div className="border p-4 rounded bg-white min-h-[300px]">
            <div 
                dangerouslySetInnerHTML={{ __html: content || `<p>${placeholder}</p>` }} 
            />
        </div>
    );
};

export default MathJaxPreview;
