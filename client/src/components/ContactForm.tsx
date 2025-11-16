import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ContactFormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

type ContactFormProps = {
  translations: {
    form: {
      name: string;
      namePlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
      sending: string;
    };
    validation: {
      nameMin: string;
      phoneMin: string;
      emailInvalid: string;
      messageMin: string;
    };
    toast: {
      title: string;
      description: string;
    };
  };
};

export function ContactForm({ translations: t }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = useMemo(() => z.object({
    name: z.string().min(2, t.validation.nameMin),
    phone: z.string().min(8, t.validation.phoneMin),
    email: z.string().email(t.validation.emailInvalid),
    message: z.string().min(10, t.validation.messageMin),
  }), [t.validation]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [contactSchema, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Contact form submitted:", data);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      console.log("About to show toast with title:", t.toast.title);
      const toastResult = toast({
        title: t.toast.title,
        description: t.toast.description,
      });
      console.log("Toast created with ID:", toastResult.id);
      
      console.log("Resetting form...");
      form.reset();
      console.log("Form reset complete");
      
      setIsSubmitting(false);
      console.log("Submission complete");
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t.form.name}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.namePlaceholder}
                  data-testid="input-name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t.form.phone}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t.form.phonePlaceholder}
                  data-testid="input-phone"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t.form.email}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t.form.emailPlaceholder}
                  data-testid="input-email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t.form.message}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t.form.messagePlaceholder}
                  rows={5}
                  data-testid="input-message"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          data-testid="button-submit"
        >
          {isSubmitting ? t.form.sending : t.form.submit}
        </Button>
      </form>
    </Form>
  );
}
