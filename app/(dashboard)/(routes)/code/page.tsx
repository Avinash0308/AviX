"use client";

import * as z from "zod";
import axios from "axios";
import { Code } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";


import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/ui/empty";
import { useProModal } from "@/hooks/use-pro-modal";

import { formSchema } from "./constants";
type messageType = {
  role: string,
  content: string,
  history?: string
}
const CodePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<messageType[]>([{role: "model", content: "Hi, I can generate code for you", history: ""}]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const isLoading = form.formState.isSubmitting;
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: messageType = { role: "user", content: values.prompt };
      const newMessages = messages[messages.length-1].history + "   " + userMessage.content;
      
      const response = await axios.post('/api/code', { messages: newMessages });
      setMessages((current) => [...current, userMessage, {role: "model", content: response.data, history: newMessages}]);
      
      form.reset();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  }

  return ( 
    <div>
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="
                rounded-lg 
                border 
                w-full 
                p-4 
                px-3 
                md:px-6 
                focus-within:shadow-sm
                grid
                grid-cols-12
                gap-2
              "
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading} 
                        placeholder="Simple toggle button using react hooks." 
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="No conversation started." />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.content} className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}>
                  <div className={cn("flex items-start gap-3 max-w-[90%]", isUser && "flex-row-reverse")}>
                    <div className="flex-shrink-0 mt-1">
                      {isUser ? <UserAvatar /> : <BotAvatar />}
                    </div>
                    <div
                      className={cn(
                        "p-4 md:p-5 rounded-2xl w-fit max-w-full shadow-sm",
                        isUser
                          ? "bg-violet-600/10 dark:bg-violet-500/20 border border-violet-500/25 rounded-tr-xs"
                          : "bg-muted dark:bg-zinc-900/90 border border-border/80 rounded-tl-xs"
                      )}
                    >
                      <ReactMarkdown
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="overflow-auto w-full my-2 bg-black/10 dark:bg-zinc-950 p-2 rounded-lg">
                              <pre {...props} />
                            </div>
                          ),
                          code: ({ node, ...props }) => (
                            <code className="bg-black/10 dark:bg-zinc-800 rounded-lg p-1" {...props} />
                          ),
                        }}
                        className="text-sm overflow-hidden leading-7"
                      >
                        {Array.isArray(message.content)
                          ? message.content
                              .map((part, partIndex) => {
                                if ("text" in part) {
                                  return <span key={partIndex}>{part.text}</span>;
                                } else {
                                  return null;
                                }
                              })
                              .join("")
                          : message.content || ""}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
   );
}
 
export default CodePage;

