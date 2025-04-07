import React from "react";

type IfProps = {
  condition: boolean;
  children: React.ReactNode;
  callback?: React.ReactNode;
};

export function If({ condition, children, callback = null }: IfProps) {
  return condition ? children : callback;
}
