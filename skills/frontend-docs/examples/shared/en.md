---
title: Gradient Descent, Explained
subtitle: From the update rule to convergence guarantees
kicker: Lecture 4 · Optimization
author: Dr. Maryam Mirzakhani
org: University of Tabriz
date: 12 March 2026
lang: en
---

# Introduction to Gradient Descent

Gradient descent minimizes a differentiable function $f:\mathbb{R}^n\to\mathbb{R}$ by repeatedly stepping against its gradient. It is the workhorse of modern machine learning, from linear regression to deep networks.

::: abstract
We derive the update rule $x_{k+1}=x_k-\eta\nabla f(x_k)$, prove linear convergence for strongly convex objectives, and show a short reference implementation.
:::

## The update rule

For a step size $\eta>0$ the iteration is

$$
x_{k+1} = x_k - \eta\,\nabla f(x_k), \qquad k = 0,1,2,\dots
$$

::: definition
A function $f$ is **$\mu$-strongly convex** if for all $x,y$

$$f(y)\ge f(x)+\nabla f(x)^\top (y-x)+\tfrac{\mu}{2}\lVert y-x\rVert^2 .$$
:::

::: theorem
If $f$ is $\mu$-strongly convex with $L$-Lipschitz gradient and $\eta\le 1/L$, then
$\lVert x_k-x^\star\rVert^2 \le (1-\eta\mu)^k\,\lVert x_0-x^\star\rVert^2 .$
:::

::: proof
Expand $\lVert x_{k+1}-x^\star\rVert^2$, use strong convexity and co-coercivity of $\nabla f$, and simplify with $\eta\le 1/L$.
:::

## Reference implementation

```python
import numpy as np

def gradient_descent(grad, x0, eta=0.1, steps=200):
    """Plain fixed-step gradient descent."""
    x = np.asarray(x0, dtype=float)
    for _ in range(steps):
        x = x - eta * grad(x)
    return x

# minimize f(x) = ||x||^2 / 2  ->  grad = x
print(gradient_descent(lambda x: x, [4.0, -2.0]))
```

Choose `eta` below $2/L$; larger steps diverge[^1].

| Method | Per-step cost | Rate |
|---|---|---|
| Gradient descent | $O(n)$ | linear |
| Newton | $O(n^3)$ | quadratic |
| Momentum | $O(n)$ | accelerated |

::: tip
Plot $f(x_k)$ on a log scale: a straight line means linear convergence.
:::

## Exercises

::: exercise
Show that for $f(x)=\tfrac12 x^\top A x$ with $A\succ 0$ the best constant step is $\eta = 2/(\lambda_{\min}+\lambda_{\max})$.
:::

::: answer
Minimize $\max_i \lvert 1-\eta\lambda_i\rvert$; the optimum equalizes the two extreme eigenvalues.
:::

[^1]: $L$ denotes the Lipschitz constant of $\nabla f$.
