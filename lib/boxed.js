// import { useState, useContext, createContext } from "react"
// import produce, { Draft } from "immer"
// import { Z_BLOCK } from "zlib"
// type Pointer = (string | number)[]
// const BoxedValueContext = createContext<BoxedValue<any>>(null)
// interface BoxedValue<T> {
//   readonly path: Pointer
//   readonly value: T
//   rootProducer(pointer: Pointer[], func: (t: T) => void): void
//   onChange(func: (t: T) => void): void
//   observe: T extends []
//     ? ((pointer: number) => BoxedValue<T[number]>)
//     : <F extends keyof T>(pointer: F) => BoxedValue<T[F]>
// }
// function createBoxedValue<T>(value: T, rootProducer: (draft: Draft<T>) => void) {
//   return {
//     value,
//     path: [],
//     rootProducer: rootProducer,
//     apply: (func: (draft: Draft<T>) => func),
//     // @ts-ignore
//     observe(pointer) {
//       return {
//         value: value[pointer],
//         path: [pointer],
//         rootProducer: rootProducer,
//         onChange: value => rootProducer([pointer as any], value)
//       }
//     }
//   }
// }
// const box = useBox()
// // interface Changer<T> {
// //   readonly pointer: Pointer
// //   readonly func: (draft: T) => void
// // }
// export function boxedValueSource() {}
// // extends [] | { [key: string]: any }
// export function useRootBox<T extends {}>(
//   value: T,
//   handler: (pointer: Pointer[], func: (draft: any) => void) => void
// ): BoxedValue<T> {
//   return {
//     value,
//     path: [],
//     rootProducer: handler,
//     onChange: value => handler([], value),
//     // @ts-ignore
//     observe(pointer) {
//       return {
//         value: value[pointer],
//         path: [pointer],
//         rootProducer: handler,
//         onChange: value => handler([pointer as any], value)
//       }
//     }
//   }
// }
// export function useBox<T>(): BoxedValue<T> {
//   const parent = useContext(BoxedValueContext)
//   if (!parent)
//     throw new Error("The useBox() hook requies an ancestral BoxedValueProvider")
//   return parent
// }
// ///////
// type Structure = {
//   label: string
//   shape: {
//     name: string
//     colours: {
//       r: string
//       g: string
//       b: string
//       tags: string[]
//     }[]
//   }
// }
// export function BoxedValueExample() {
//   const [value, setValue] = useState(initialValue)
//   const root = useRootBox<T>(value, apply => {
//     const nextValue = produce(draft => apply(draft))
//     setValue(nextValue)
//   })
//   root.observe()
// }
"use strict";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ib3hlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7IHVzZVN0YXRlLCB1c2VDb250ZXh0LCBjcmVhdGVDb250ZXh0IH0gZnJvbSBcInJlYWN0XCJcbi8vIGltcG9ydCBwcm9kdWNlLCB7IERyYWZ0IH0gZnJvbSBcImltbWVyXCJcbi8vIGltcG9ydCB7IFpfQkxPQ0sgfSBmcm9tIFwiemxpYlwiXG4vLyB0eXBlIFBvaW50ZXIgPSAoc3RyaW5nIHwgbnVtYmVyKVtdXG5cbi8vIGNvbnN0IEJveGVkVmFsdWVDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxCb3hlZFZhbHVlPGFueT4+KG51bGwpXG5cbi8vIGludGVyZmFjZSBCb3hlZFZhbHVlPFQ+IHtcbi8vICAgcmVhZG9ubHkgcGF0aDogUG9pbnRlclxuLy8gICByZWFkb25seSB2YWx1ZTogVFxuLy8gICByb290UHJvZHVjZXIocG9pbnRlcjogUG9pbnRlcltdLCBmdW5jOiAodDogVCkgPT4gdm9pZCk6IHZvaWRcbi8vICAgb25DaGFuZ2UoZnVuYzogKHQ6IFQpID0+IHZvaWQpOiB2b2lkXG4vLyAgIG9ic2VydmU6IFQgZXh0ZW5kcyBbXVxuLy8gICAgID8gKChwb2ludGVyOiBudW1iZXIpID0+IEJveGVkVmFsdWU8VFtudW1iZXJdPilcbi8vICAgICA6IDxGIGV4dGVuZHMga2V5b2YgVD4ocG9pbnRlcjogRikgPT4gQm94ZWRWYWx1ZTxUW0ZdPlxuLy8gfVxuXG4vLyBmdW5jdGlvbiBjcmVhdGVCb3hlZFZhbHVlPFQ+KHZhbHVlOiBULCByb290UHJvZHVjZXI6IChkcmFmdDogRHJhZnQ8VD4pID0+IHZvaWQpIHtcbi8vICAgcmV0dXJuIHtcbi8vICAgICB2YWx1ZSxcbi8vICAgICBwYXRoOiBbXSxcbi8vICAgICByb290UHJvZHVjZXI6IHJvb3RQcm9kdWNlcixcbi8vICAgICBhcHBseTogKGZ1bmM6IChkcmFmdDogRHJhZnQ8VD4pID0+IGZ1bmMpLFxuLy8gICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICBvYnNlcnZlKHBvaW50ZXIpIHtcbi8vICAgICAgIHJldHVybiB7XG4vLyAgICAgICAgIHZhbHVlOiB2YWx1ZVtwb2ludGVyXSxcbi8vICAgICAgICAgcGF0aDogW3BvaW50ZXJdLFxuLy8gICAgICAgICByb290UHJvZHVjZXI6IHJvb3RQcm9kdWNlcixcbi8vICAgICAgICAgb25DaGFuZ2U6IHZhbHVlID0+IHJvb3RQcm9kdWNlcihbcG9pbnRlciBhcyBhbnldLCB2YWx1ZSlcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cblxuLy8gY29uc3QgYm94ID0gdXNlQm94KClcblxuLy8gLy8gaW50ZXJmYWNlIENoYW5nZXI8VD4ge1xuLy8gLy8gICByZWFkb25seSBwb2ludGVyOiBQb2ludGVyXG4vLyAvLyAgIHJlYWRvbmx5IGZ1bmM6IChkcmFmdDogVCkgPT4gdm9pZFxuLy8gLy8gfVxuXG4vLyBleHBvcnQgZnVuY3Rpb24gYm94ZWRWYWx1ZVNvdXJjZSgpIHt9XG5cbi8vIC8vIGV4dGVuZHMgW10gfCB7IFtrZXk6IHN0cmluZ106IGFueSB9XG4vLyBleHBvcnQgZnVuY3Rpb24gdXNlUm9vdEJveDxUIGV4dGVuZHMge30+KFxuLy8gICB2YWx1ZTogVCxcbi8vICAgaGFuZGxlcjogKHBvaW50ZXI6IFBvaW50ZXJbXSwgZnVuYzogKGRyYWZ0OiBhbnkpID0+IHZvaWQpID0+IHZvaWRcbi8vICk6IEJveGVkVmFsdWU8VD4ge1xuLy8gICByZXR1cm4ge1xuLy8gICAgIHZhbHVlLFxuLy8gICAgIHBhdGg6IFtdLFxuLy8gICAgIHJvb3RQcm9kdWNlcjogaGFuZGxlcixcbi8vICAgICBvbkNoYW5nZTogdmFsdWUgPT4gaGFuZGxlcihbXSwgdmFsdWUpLFxuLy8gICAgIC8vIEB0cy1pZ25vcmVcbi8vICAgICBvYnNlcnZlKHBvaW50ZXIpIHtcbi8vICAgICAgIHJldHVybiB7XG4vLyAgICAgICAgIHZhbHVlOiB2YWx1ZVtwb2ludGVyXSxcbi8vICAgICAgICAgcGF0aDogW3BvaW50ZXJdLFxuLy8gICAgICAgICByb290UHJvZHVjZXI6IGhhbmRsZXIsXG4vLyAgICAgICAgIG9uQ2hhbmdlOiB2YWx1ZSA9PiBoYW5kbGVyKFtwb2ludGVyIGFzIGFueV0sIHZhbHVlKVxuLy8gICAgICAgfVxuLy8gICAgIH1cbi8vICAgfVxuLy8gfVxuXG4vLyBleHBvcnQgZnVuY3Rpb24gdXNlQm94PFQ+KCk6IEJveGVkVmFsdWU8VD4ge1xuLy8gICBjb25zdCBwYXJlbnQgPSB1c2VDb250ZXh0KEJveGVkVmFsdWVDb250ZXh0KVxuLy8gICBpZiAoIXBhcmVudClcbi8vICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgdXNlQm94KCkgaG9vayByZXF1aWVzIGFuIGFuY2VzdHJhbCBCb3hlZFZhbHVlUHJvdmlkZXJcIilcbi8vICAgcmV0dXJuIHBhcmVudFxuLy8gfVxuXG4vLyAvLy8vLy8vXG5cbi8vIHR5cGUgU3RydWN0dXJlID0ge1xuLy8gICBsYWJlbDogc3RyaW5nXG4vLyAgIHNoYXBlOiB7XG4vLyAgICAgbmFtZTogc3RyaW5nXG4vLyAgICAgY29sb3Vyczoge1xuLy8gICAgICAgcjogc3RyaW5nXG4vLyAgICAgICBnOiBzdHJpbmdcbi8vICAgICAgIGI6IHN0cmluZ1xuLy8gICAgICAgdGFnczogc3RyaW5nW11cbi8vICAgICB9W11cbi8vICAgfVxuLy8gfVxuXG4vLyBleHBvcnQgZnVuY3Rpb24gQm94ZWRWYWx1ZUV4YW1wbGUoKSB7XG4vLyAgIGNvbnN0IFt2YWx1ZSwgc2V0VmFsdWVdID0gdXNlU3RhdGUoaW5pdGlhbFZhbHVlKVxuLy8gICBjb25zdCByb290ID0gdXNlUm9vdEJveDxUPih2YWx1ZSwgYXBwbHkgPT4ge1xuLy8gICAgIGNvbnN0IG5leHRWYWx1ZSA9IHByb2R1Y2UoZHJhZnQgPT4gYXBwbHkoZHJhZnQpKVxuLy8gICAgIHNldFZhbHVlKG5leHRWYWx1ZSlcbi8vICAgfSlcbi8vICAgcm9vdC5vYnNlcnZlKClcbi8vIH1cbiJdfQ==