import { Form, Button, Input, Card, Space, Tabs } from "antd";
import MathJaxPreview from '../../../../../components/shared/MathJaxPreview';
import {
  ArrowLeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import RenderFormItem from '../../../Admin/RenderFormItem';
import { useQuery } from "@tanstack/react-query";
import { model3DService } from '../../../../../services/models.service';
import { exerciseService } from '../../../../../services/exercise.service';
import { useExerciseMutations } from "./useExerciseMutations";
import { use3DModelTypes } from '../../../3DModels/use3DModelManagement';

const AddEditExercise = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const selectedType = Form.useWatch("type", form);

  const { createExercise, updateExercise } = useExerciseMutations();
  const { types: categoryOptions, loadingTypes: loadingCategories } =
    use3DModelTypes();

  // Fetch 3D Models
  const { data: models = [] } = useQuery({
    queryKey: ["models3d"],
    queryFn: () => model3DService.getModels3D(),
  });

  const modelOptions = (models || []).map((m: any) => ({
    label: m.name || m.model_type_name,
    value: m.model_type_name,
  }));

  // Fetch Exercise Details
  const { data: exerciseData, isLoading: isLoadingExercise } = useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const all = await exerciseService.getExercises();
      return (all as any[]).find((e: any) => String(e.id) === String(id));
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (exerciseData) {
      // Parse options if valid, ensure it's array
      let options = exerciseData.options;
      if (typeof options === "string") {
        try {
          options = JSON.parse(options);
        } catch (e) {}
      }

      form.setFieldsValue({
        ...exerciseData,
        options: Array.isArray(options) ? options : [],
        question: exerciseData.question,
      });
    } else {
      // Default options for new
      form.setFieldsValue({
        type: "MultipleChoice",
        options: [
          // { id: 'A', text: '' },
          // { id: 'B', text: '' },
          // { id: 'C', text: '' },
          // { id: 'D', text: '' }
        ],
      });
    }
  }, [exerciseData, form]);

  const handleSubmit = async (values: any) => {
    // Ensure options have IDs if missing (unlikely if valid)
    const formattedValues = {
      ...values,
      options: values.type === "MultipleChoice" ? values.options || [] : [], // Ensure options is strict array, backend requires Json
      correct_answer:
        values.type === "MultipleChoice" ? values.correct_answer : null,
    };

    if (isEditMode && id) {
      updateExercise.mutate({ id, data: formattedValues });
    } else {
      createExercise.mutate(formattedValues);
    }
  };

  const loading =
    isLoadingExercise || createExercise.isPending || updateExercise.isPending;

  return (
    <div className="p-6">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/dashboard/exercises")}
        className="mb-4"
      >
        Back to List
      </Button>

      <Card
        title={isEditMode ? "View/Edit Exercise" : "Add New Exercise"}
        className="shadow-md"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RenderFormItem
              label="3D Model"
              name="model_type_name"
              type="select"
              required
              options={modelOptions}
              placeholder="Select 3D Model"
            />

            <RenderFormItem
              label="Level"
              name="level"
              type="select"
              required
              options={[
                { label: "Easy", value: "EASY" },
                { label: "Medium", value: "MEDIUM" },
                { label: "Hard", value: "HARD" },
              ]}
              placeholder="Select Level"
            />

            <RenderFormItem
              label="Scientific Category"
              name="exercise_type_name"
              type="select"
              required
              options={categoryOptions.map((t: string) => ({
                label: t,
                value: t,
              }))}
              loading={loadingCategories}
              placeholder="Select Scientific Category"
            />

            <RenderFormItem
              label="Type"
              name="type"
              type="select"
              required
              options={[
                { label: "Multiple Choice", value: "MultipleChoice" },
                { label: "Essay", value: "Essay" },
              ]}
              placeholder="Select Type"
            />

            <Form.Item name="reference" label="Reference">
              <Input placeholder="e.g. Exam 2023" />
            </Form.Item>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Question (HTML with MathJax)
            </label>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Edit HTML",
                  children: (
                    <Form.Item
                      name="question"
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Enter question... Use normal HTML and LaTeX for math (e.g. $$ E=mc^2 $$)"
                        style={{ fontFamily: "monospace" }}
                      />
                    </Form.Item>
                  ),
                },
                {
                  key: "2",
                  label: "Preview",
                  children: (
                    <MathJaxPreview
                      form={form}
                      name="question"
                      placeholder="No question to preview"
                    />
                  ),
                },
              ]}
            />
          </div>

          {selectedType === "MultipleChoice" && (
            <Card
              title="Options (Multiple Choice)"
              size="small"
              className="mb-4 bg-gray-50"
            >
              <Form.List name="options">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "id"]}
                          rules={[{ required: true, message: "Missing ID" }]}
                        >
                          <Input
                            placeholder="ID (A, B...)"
                            style={{ width: 60 }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "text"]}
                          rules={[
                            { required: true, message: "Missing Content" },
                          ]}
                        >
                          <Input
                            placeholder="Option content"
                            style={{ width: 400 }}
                          />
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Option
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item
                name="correct_answer"
                label="Correct Answer ID (Optional for Reading/Passage)"
                tooltip="Leave empty if this is a reading passage or instruction only."
              >
                <Input placeholder="Enter ID of correct option (e.g. A)" />
              </Form.Item>
            </Card>
          )}

          <Card
            title="Detailed Solution / Explanation"
            size="small"
            className="mb-4 bg-gray-50"
          >
            <Form.Item
              name="solution"
              tooltip="Detailed explanation for the answer, supports HTML and MathJax."
            >
              <Input.TextArea
                rows={6}
                placeholder="Enter the detailed explanation here..."
              />
            </Form.Item>
          </Card>

          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {isEditMode ? "Update Exercise" : "Save Exercise"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditExercise;
